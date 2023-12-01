//aqui vamos hacer nuestra conexion a nuestra base de datos mediante mongoose.

const mongoose = require("mongoose");// requerimos el paquete de mongoose

//lo llamamos y recibe la URL que es nuestra variable de entorno.
mongoose.connect(process.env.URI)
    //esto recibe una promesa
    .then(() => console.log("BD conectada 🚀"))
    //y en caso de que falle le ponemos el catch
    .catch((e) => console.log("fallo la conexión " + e))