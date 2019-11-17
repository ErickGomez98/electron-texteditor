const fs = require("fs");
const filesDir = "./docs/";
const data = [];
let files = [];
const BT = require("./Bt");

const { promisify } = require("util");
const { ipcRenderer, remote } = require("electron");
let isEditing;

document.addEventListener("DOMContentLoaded", () => {
  let Btree;
  let root;
  const readAllFiles = async () => {
    return new Promise(async (resolve, reject) => {
      await promisify(fs.readdir)(filesDir)
        .then(filenames => {
          files = filenames;
          return Promise.all(
            filenames.map(filename => {
              return promisify(fs.readFile)(filesDir + filename, {
                encoding: "utf8"
              });
            })
          );
        })
        .then(strArr => {
          strArr.forEach((str, i) => {
            const u = str.split("\n");
            data[files[i].replace(".txt", "")] = {
              edad: u[0],
              diagnostico: u[1]
            };
          });
        })
        .catch(err => {
          console.log(err);
        });
      resolve(data);
    });
  };

  const init = async () => {
    await readAllFiles();
    Btree = new BT();
    Object.keys(data).map(v => {
      Btree.insert(v);
    });
    root = Btree.getRootNode();
  };

  init();

  const onSubmit = ev => {
    ev.preventDefault();
    const values = {
      nombre: document.getElementById("inputNombre").value,
      edad: document.getElementById("inputEdad").value,
      diagnostico: document.getElementById("inputDiagnostico").value
    };

    if (isEditing) {
      remote.getCurrentWindow().close();
    } else {
      // buscar a ver si ya existe el registro
      const s = Btree.search(root, values.nombre);

      if (s) {
        alert("Ya existe ese registro");
      } else {
        ipcRenderer.send("capturar-registro", values);
      }
    }
  };

  document
    .getElementById("agregarRegistroForm")
    .addEventListener("submit", onSubmit);

  ipcRenderer.on("is-editing", (e, editing) => {
    isEditing = editing;

    if (isEditing) {
      console.log("isEditing", isEditing);
      // Mostrar los valores en los input.
      document.getElementById("inputNombre").value = isEditing.nombre;
      document.getElementById("inputEdad").value = isEditing.edad.replace(
        "\r",
        ""
      );
      document.getElementById("inputDiagnostico").value = isEditing.diagnostico;

      // Deshabilitar los input
      document.getElementById("inputNombre").disabled = true;
      document.getElementById("inputEdad").disabled = true;
      document.getElementById("inputDiagnostico").disabled = true;

      // Cambiar text de button sumbit
      document.getElementById("buttonSubmit").innerText = "Regresar";
    }
  });
});
