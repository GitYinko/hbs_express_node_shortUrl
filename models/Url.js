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
    },
    user: { // vamos hacer una seudorelacion atrvez de una referencia mongoDB, AQUI ES DONDE PODEMOS INDICAR EL ID DE USER QUE VA A AGREGAR UNA URL SOLO PARA UN USUARIO Y PODER USAR UN CRUD EN ESE USAURIO.

        type: Schema.Types.ObjectId, // esto lo gestiona mongoose para que tengamos un usuario con su respestivo id

        ref: "User", //aqui vamos a tener la referencia que es el nombre del modelo y schema al que se quiere hacer referencia.

        required: true
    }

})

// y para que nosotros podamos hacer un CRUD con nuestro documento tenemos que llevarlos a un modelo.



const Url = mongoose.model("Url", urlSchema);//se recomin que la primera letra de la primer palabra sea en mayuscula y en singular. al metodo model le colocamos el nombre al cual se le va a colocar a la coleccion del la base de datos y le pasamos el schema que va a utilizar que es "urlSchema"

//la exportamos
module.exports = Url;
// para poder acceder a los metodos CRUD