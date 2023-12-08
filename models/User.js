//vamos hacer otro medelo de schema para registrar usuarios y poder usar los metodos crud.

//EXPORTACIONES
//llamaos a mongoose
const mongoose = require("mongoose");

//llamamos al a la clase "schema" de mongoose
const { Schema } = mongoose;

//llamamos al paquetito bcryptjs
const bcrypt = require("bcryptjs");




//el esquema es una estructura donde definimos a cada unos de los usuarios
const userSchema = new Schema({

    userName: {
        type: String,
        required: true,
        lowercase: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        index: { unique: true }
    },
    password: {
        type: String,
        required: true
    },
    tokenConfirm: { // este token nos va a servir para confirmar las cuentas de usuario, cada vez que un usaruio se registre vamos hacer que rebice en la bandeja de gmail para confirmar su cuenta.

        type: String,
        default: null

    },
    confirm: { //para saber si la cuenta es confirmada

        type: Boolean,
        default: false // por defecto va a estar en falsa pero cuando el usuario confirme la cuenta en su correo electronico va a pasar a true.

    },
    imagen: {

        type: String, //lo hacemos de tipo string por no la vamos a guardar en la DB si no que en el servidor.
        default: null, // por que un usuario cuando se registra no va a tener una img de perfil.

    }

});

//vamos a usar un paqute que nos va a servir para hashiar las contraseñas y su nombre es "bcryptjs". Bcrypt admite métodos de sincronización y asíncrono. Se recomienda el enfoque asíncrono porque el hash consume mucha CPU y la versión síncrona bloqueará el bucle de eventos y evitará que su aplicación maneje otras solicitudes hasta que finalice.

// por lo tanto vamos a generar el metodo.

// aqui usamos un metodo de mongoose pre.("save") y lo que quiere decir esto es que antes que se guarde algo en la BD pueda hacer otra cosa, por ejemplo, encriptar las contraseñas.
userSchema.pre("save", async function (next) { // utilizamos el funtion para poder acceder al "this" ya que con una funtion arrow no se puede acceder al "this" y el this va a ser cada uno de las propiedades del schema.

    const user = this;

    //ahora vamos a preguntar si user en la propiedad password ya fue modificada, es decir, que ya esta hashiada le decimos que siga con los demas metodos
    if (!user.isModified("password")) return next();

    //en caso de que la contraseña no este hashiada la vamos a hashiar.
    try {

        //para hashiar a que hacer saltos que son como palabras aleatoreas que ese le estan incorporando para que no podramos desifrar esa contraseña
        const salt = await bcrypt.genSalt(10)

        //una vez que tenmos esos saltos los encriptamos con "hashSync" que va a recibir la contraseña y los saltos
        const hash = await bcrypt.hash(user.password, salt)

        //y una vez que tenemos esa contraseña hashiada le tenemos que decir que la guarde en la DB.
        user.password = hash;
        next();

    } catch (error) {

        //validar si falla la encriptacion de contraseñas
        console.log(error)

        throw new Error("Error al codificar la contraseña")


    }

})


//vamos a crear un metodo para validar contraseñas. Llamamos a nuestro schema y le pasamos un metodo adicional como si fuera un prototype "methods.comparePassword"
userSchema.methods.comparePassword = async function (candidatePassword) { // hacemos un parametro en el que vamos a recibir la contraseña para comparar y dar una respuesta.

    return await bcrypt.compare(candidatePassword, this.password);// retornamos la comparacion que hace el metodo compare del paquete bcrypt, que recibe la contraseña que queremos verificar con la que viene de la BD.

} // este metodo va a retornar un booleano evaluando si el password que ingreso el user es coinside o no.


//una vez que ya tenemos la estructura(schema) lo tenemos que pasar a un modelo
//vamos a exportar para poder acceder a este esquema.
module.exports = mongoose.model("User", userSchema); // le pasamos el nombre de la collecion y el esquema que va a seguir. el nombre del esquema automaticamente me lo transforma a lowercase y en plural.