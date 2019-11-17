const { ipcRenderer } = require("electron");
const fs = require("fs");
const filesDir = "./docs/";
const data = [];
let files = [];
const BT = require("./Bt");
let Btree;
let root;
const { promisify } = require("util");
document.addEventListener("DOMContentLoaded", () => {
  const readAllFiles = () => {
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

  const writeFile = async data => {
    return new Promise(async (resolve, reject) => {
      await promisify(fs.writeFile)(
        filesDir + `${data.nombre}.txt`,
        data.edad + "\n" + data.diagnostico
      )
        .then(res => {
          // Una vez creado el archivo, insertar el nodo en el arbol.
          Btree.insert(data.nombre);
          resolve();
        })
        .catch(err => {
          console.log(err);
        });
    });
  };

  const deleteFile = nombre => {
    return new Promise(async (resolve, reject) => {
      await promisify(fs.unlink)(filesDir + `${nombre}.txt`)
        .then(res => {
          // Una vez eliminado el archivo, eliminar el nodo en el arbol.
          Btree.remove(nombre);
          resolve();
        })
        .catch(err => {
          console.log(err);
        });
    });
  };

  const readFile = nombre => {
    return new Promise(async (resolve, reject) => {
      await promisify(fs.readFile)(filesDir + `${nombre}.txt`, {
        encoding: "utf8"
      })
        .then(res => {
          const u = res.split("\n");
          resolve({
            nombre,
            edad: u[0],
            diagnostico: u[1]
          });
        })
        .catch(err => {
          console.log(err);
        });
    });
  };

  document
    .getElementById("buttonSearch")
    .addEventListener("click", async () => {
      const searchVal = document.getElementById("searchInput").value;

      const s = Btree.search(root, searchVal);

      if (s) {
        const info = await readFile(searchVal);
        ipcRenderer.send("agregar-nuevo-open-view", info);
        document.getElementById("searchInput").value = "";
      } else {
        alert("No se encontró el registro");
      }
    });

  document
    .getElementById("buttonDelete")
    .addEventListener("click", async () => {
      const deleteVal = document.getElementById("deleteInput").value;
      const s = Btree.search(root, deleteVal);

      if (s) {
        await deleteFile(deleteVal);
        document.getElementById("deleteInput").value = "";
        alert("Registro eliminado");
      } else {
        alert("No se encontró el registro para eliminar");
      }
    });

  document.getElementById("agregarNuevo").addEventListener("click", () => {
    ipcRenderer.send("agregar-nuevo-open-view", false);
  });

  ipcRenderer.on("agregar-registro-tree", async (ev, data) => {
    await writeFile(data);
  });
});
