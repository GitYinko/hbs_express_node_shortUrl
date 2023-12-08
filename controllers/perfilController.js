//este controlador lo hacemos solo para mostrar otra forma de exportar los metodos del controlador, ya que se podria hacer este metodo del perfil en el homeController que es parte de la ruta en la que lo llamamos.


//importaciones
const formidable = require("formidable");

const path = require("path"); //importamos un modulo nativo de node para interpretar las rutas de archivos.

const fs = require("fs"); //llamamos a otro modulo nativo de nodo que es manipular los archivos de nuestro sistema

const Jimp = require("jimp");//para redimesionar la imagen y oprimizarla.

const User = require("../models/User");


module.exports.formPerfil = async (req, res,) => { //rederizamos el perfil

    try {

        const userPerfil = await User.findById(req.user.id); //userPerfil va a tener la img que le envia el usaurio.

        return res.render("perfil", { user: req.user, imagen: userPerfil.imagen })//aqui enviamos la info que esta en el user que viene del requery que tiene el id y el name y la imagen viene de userperfil que le instanciamos el modelo User.


    } catch (error) {

        req.flash("mensajes", [{ msg: "Error al leer el usuario" }]);
        return res.redirect("/perfil");


    }

}

module.exports.editarFotoPerfil = (req, res) => { //configuramos img perfil

    //otra forma en las ultimas versiones
    // const form = formidable(options);

    //hacemos una instancia del paquete formidable. Y usamos el metodo "IncomingForm()
    const form = new formidable.IncomingForm(); //nos va servir para dar tamaños de img espesificos.


    form.maxFileSize = 50 * 1024 * 1024; // pasamos un tamaño maximo que vamos a perdir para la img. Esto equivale a 50MG


    //vamos a procesar la imagen
    form.parse(req, async (err, fields, files) => {//el req va a traer la img desde el body, async lo usamos por que vamos al consultar a la BD.

        if (err) {
            req.flash("mensajes", [{ msg: "falló formidable" }]);
            return res.redirect("/perfil");
        }

        const file = files.myfile; // donde vamos a recibir los archivos.

        try {

            console.log(file)

            //hacemos una validacion preguntando si el usuario intento enviar un archivo vacio.
            if (file.originalFilename === "") {

                throw new Error("Por favor ingrese una imagen");

            }

            //vamos hacer un array de los formatos de archivos que solo vamos a admitir.
            const imageTypes = [

                "image/jpeg",
                "image/jpg",
                "image/png",
                "image/webp",
                "image/gif",

            ]

            //ahora vamos hacer una validacion para saber si el usuario cumple con los formatos admitidos. 
            if (!imageTypes.includes(file.mimetype)) {//preguntamos si el archivo incluido por el usuario no se encuantra en nuestra matriz
                throw new Error("Por favor agrega una imagen .jpg o png");
            }

            // //hacemos otra validacion para el tamaño de la imagen
            if (file.size > 50 * 1024 * 1024) {
                throw new Error("Máximo 50MB");
            }

            //vamos hacer una extension
            const extension = file.mimetype.split("/")[1];//el metodo split nos separa un string en un array y vamos a poder acceder al indice en este caso en el 1. que va hacer el string que esta despues del /, ej:image/jpeg

            //vamos a decir donde se guarde el archivo.
            const dirFile = path.join(__dirname,
                `../public/Img/perfiles/${req.user.id}.${extension}`); //llamamos al path y join que nos va a juntar las rutas de nuestro directorio. le pasamos __dirname para que busque los directorios en este archivo y le pasamos la ruta donde va a guardar el archivo, le pasamos el nombre y la extension de forma dinamica.


            //esto va a tomar la ruta antigua y la nueva para renombrarla. Pero como tenemos las rutas en partiones diferentes no puede hacer esta accion.
            // fs.renameSync(file.filepath, dirFile);


            //por lo tanto vamos a usar "copyFile" se utiliza para copiar de forma asincrónica un archivo desde la ruta de origen a la ruta de destino. De forma predeterminada, Node.js sobrescribirá el archivo si ya existe en el destino indicado. El parámetro de modo opcional se puede utilizar para modificar el comportamiento de la operación de copia.
            fs.copyFile(file.filepath, dirFile, (err) => {
                if (err) {
                    console.log("Error Found:", err);
                }
            });

            console.log(dirFile); //ruta que a la que mandamos el archivo.

            //ahora atravez de jimp vamos a redimensionar la imagen, es decir, reducir su tamaño.
            const image = await Jimp.read(dirFile);//vamos a leer un achivo que va hacer el que esta en dirFile que va hacer la ruta donde va a estar el archivo que sube el usuario.

            //ahora vamos a configurar una serie de metodos que no provee Jimp
            image
                .resize(200, 200) // cambia el tamaño
                .quality(90)//la calidad
                .write(dirFile);//y guaradamos de forma asincrona


            //vamos a guardar la imagen en la propiedad imagen del modelo User.
            const user = await User.findById(req.user.id);

            user.imagen = `${req.user.id}.${extension}`;//le pasamos la nombre que va a llevar la imagen.

            //una vez que tenemos la imagen podemos proseder a guardarla 
            await user.save();// siempre caulquier operacion que se vaya hacer en la BD TENEMOS QUE HACER EL AWAIT.


            req.flash("mensajes", [{ msg: "Se subió la imagen" }]);


        } catch (error) {

            req.flash("mensajes", [{ msg: error.message }]);

        }
        finally {

            return res.redirect("/perfil");

        }
    })
}

//vamos a instalar un paquete para subir archivos a nuestro servidor llamado "formidable" es un módulo de Node.js para analizar datos de formularios, especialmente cargas de archivos.

// otro opcion es un que podriamos usar para cargar archivos al servidor se llama "Multer" es un middleware de node.js para manejar datos de formularios/multipartes, que se utiliza principalmente para cargar archivo.

//tambien vamos a instalar un paquete llamdo "jimp" que es una biblioteca de procesamiento de imágenes para Node escrita completamente en JavaScript, sin dependencias nativas. esto nos permite redimensionar la img para optimizarla y guardarla mas liviana. Por lo tanto toda imagen subida por el usuario se va a optimizar a una resolucion dada por nosotros. 

