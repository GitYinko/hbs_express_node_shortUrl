// express.Router
// Utilice la clase express.Router para crear manejadores de rutas montables y modulares. Una instancia Router es un sistema de middleware y direccionamiento completo; por este motivo, a menudo se conoce como una “miniaplicación”.

//router sirve para poder separa o modular en archivos las peticiones http del cliente.


const express = require("express"); //Inicializamos express

const router = express.Router(); //vamos a trabajar con router express


//vamos a usar router con los manejadores de rutas
router.get("/", (req, res) => {

    //vamos a simular una BD
    const urls = [
        { origin: "www.google.com/yinko1", shortURL: "dasdasda1" },
        { origin: "www.google.com/yinko2", shortURL: "dasdasda2" },
        { origin: "www.google.com/yinko3", shortURL: "dasdasda3" },
    ]

    res.render("home", { titulo: "Pagina principal 👋", urls })

})



module.exports = router; // esxportamos este routeer que es el que vamos a usar en el archivo raiz que seria en este caso el index.js.


//MONGODB
// trabaja con colecciones
//cluster0 seria como nuestro servidor en donde van a estar nuestras BD

//network access es para configurar nuestra ip

//database access configuramos un usuario.