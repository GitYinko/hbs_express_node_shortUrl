// express.Router
// Utilice la clase express.Router para crear manejadores de rutas montables y modulares. Una instancia Router es un sistema de middleware y direccionamiento completo; por este motivo, a menudo se conoce como una “miniaplicación”.

//router sirve para poder separa o modular en archivos las peticiones http del cliente.


const express = require("express"); //Inicializamos express

const { leerUrls, agregarUrl, eliminarUrl, editarUrlForm, editarUrl, redireccionamiento } = require("../controllers/homeController");//exportacion del los metodos crud

//exportamos los middleware
const urlValidar = require("../middlewares/urlValida");
const verificarUser = require("../middlewares/verificarUser");

const router = express.Router(); //vamos a trabajar con router express


//vamos a usar router con los manejadores de rutas
router.get("/", verificarUser, leerUrls)//vamos a leer los datos sempre y cuando el usuario este autenticado.
router.post("/", urlValidar, agregarUrl)
router.get("/eliminar/:id", eliminarUrl)// le mandamos la ruta parametrisada que tenemos en el btn eliminar y le pasamos el metodo para eliminar.
router.get("/editar/:id", editarUrlForm)
router.post("/editar/:id", urlValidar, editarUrl)
router.get("/:shortURL", redireccionamiento);



module.exports = router; // esxportamos este routeer que es el que vamos a usar en el archivo raiz que seria en este caso el index.js.


//MONGODB
// trabaja con colecciones
//cluster0 seria como nuestro servidor en donde van a estar nuestras BD

//network access es para configurar nuestra ip

//database access configuramos un usuario.