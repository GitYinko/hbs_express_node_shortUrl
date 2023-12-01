
//vamos a llamar a un modulo nativo de node.js
const { URL } = require("url")


//creamos un middleware para validar nuestras url y que no puedan mandar otras cosas.
const urlValidar = (req, res, next) => {

    try {
        //hacemos una destruturacion del req.body y traemos nuestro propiedad origin que contiene que url que pasamos por el form.
        const { origin } = req.body;

        //creamos otra constante en la ese origin va hacer una nueva instancia de ese modulo llamdo URL
        const urlFrontEnd = new URL(origin);

        //ese modulo URL tiene algunas propiedades como origin. por lo tanto le decimos que si la url es distinto a "null" estamnos diciendo que es una url valida, es decir, que tiene formato de una url. Por lo tanto con "next" hacemos que siga con el siguiente metodo. caso contrario le mostramos el error
        if (urlFrontEnd.origin !== "null") {

            if (urlFrontEnd.protocol === "http:" || urlFrontEnd.protocol === "https:") {

                return next()

            }


        } else {

            throw new Error("Url no valida 😱")

        }


    } catch (error) {

        return res.send("Url no valida papi")

    }

}


module.exports = urlValidar;