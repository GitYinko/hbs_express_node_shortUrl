//aqui vamos hacer nuestra conexion a nuestra base de datos mediante mongoose.

const mongoose = require("mongoose");// requerimos el paquete de mongoose

require("dotenv").config();//para acceder la process y las variables de entorno.



const clientDB = mongoose //lo llamamos y recibe la URL que es nuestra variable de entorno.
    .connect(process.env.URI)
    //esto recibe una promesa
    .then((m) => {
        console.log("BD conectada 🚀");
        return m.connection.getClient(); //Esto nos va a traer el cliente que nosotros nos estamos conectando.
    })
    //y en caso de que falle le ponemos el catch
    .catch((e) => console.log("fallo la conexión " + e))


module.exports = clientDB;