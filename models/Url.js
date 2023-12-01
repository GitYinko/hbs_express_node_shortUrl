// Schema: Con Mongoose, todo se deriva de un esquema.
// Cada esquema se asigna a una colección MongoDB y define la forma de los documentos dentro de esa colección.

const mongoose = require("mongoose");// exportamos mongoose

const { Schema } = mongoose;// llamamos a la class schema de mongoose


//hacemos una constante en la que vamos a definir nuestro esquema, que define como va hacer la estructura de nuestro documento.
const urlSchema = new Schema({ // y va a recibir sus propiedades

    origin: {
        type: String,
        unique: false,
        require: true
    },
    shortURL: {
        type: String,
        unique: true,
        require: true
    }

})

// y para que nosotros podamos hacer un CRUD con nuestro documento tenemos que llevarlos a un modelo.



const Url = mongoose.model("Url", urlSchema);//se recomin que la primera letra de la primer palabra sea en mayuscula y en singular. al metodo model le colocamos el nombre al cual se le va a colocar a la coleccion del la base de datos y le pasamos el schema que va a utilizar que es "urlSchema"

//la exportamos
module.exports = Url;
// para poder acceder a los metodos CRUD