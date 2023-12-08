// como estamos utilizando el modelo vista controlador

//aqui vamos a tener toda la logica de los metodos CRUD del home


// importamos el model
const Url = require("../models/Url");

const { nanoid } = require("nanoid");

const User = require("../models/User");



//vamos a crear un metodo para leer 
const leerUrls = async (req, res) => {

    // console.log(req.user) // todas las rutas que tengan el middleware verificarUser tiene a disposicion el req.user

    const { confirm } = req.body;


    //vamos a leer los datos de BD
    try {

        let activeNav = false;

        //creamos a una constante en la que esperamos el modelo Url y vamos a leer esa informacion mediante el metodo find y vamos a establece con que parametros de busqueda vamos a filtrar, llamamos a lean que nos transforma el array de objetos de mongoose que seria como objetos que nos permite hacer mas cosas pero hbs no lo lee por lo tanto "lean" nos transforma esos objetos a los tradicionales de javaScript.
        const urls = await Url.find({ user: req.user.id }).lean()

        const user = await User.find(confirm)

        if (user) {
            activeNav = true;
        }

        return res.render("home", { activeNav, titulo: "Pagina principal 👋", urls })


    } catch (error) {

        req.flash("mensajes", [{ msg: error.message }])

        return res.redirect("/");

    }

}

//creamos metodo para agregar. 
const agregarUrl = async (req, res) => {

    const { origin } = req.body;

    try {

        //llamamos al modelo
        const url = new Url({ origin, shortURL: nanoid(8), user: req.user.id });//le pasamos el largo de ese nanoid y hacemos la referencia a un usuario que esta activo

        //lo enviamos a la BD
        await url.save();

        //enviamos un mensaje
        req.flash("mensajes", [{ msg: "Url agregada" }])

        //y lo volvemos a la pagina de inicio.
        res.redirect("/");


    } catch (error) {

        req.flash("mensajes", [{ msg: error.message }])

        return res.redirect("/");

    }


}

//creamos metodo para eliminar una url. usamos async ya que vamos hacer una solisitud
const eliminarUrl = async (req, res) => {

    //capturamos el id del parametro de la ruta 
    const { id } = req.params;

    try {

        //y con el metodo findByIdAndDelete lo eliminamos que lo que hace este metodo es buscar por id y eliminarlo.
        // await Url.findByIdAndDelete(id);

        const url = await Url.findById(id); //con esto vamos a tener la url que le corresponde a ese usuario

        if (!url.user.equals(req.user.id)) {//preguntamos si el id del reques.user del usuario no es igual al del usuario del schema Url le mandamos un mensaje de error.

            throw new Error("No se puedo eliminar la Url");

        }

        // y se el usuario es el mismo, eliminamos la url de ese usuario con el metodo deleteOne de mongoose.
        await url.deleteOne();

        req.flash("mensajes", [{ msg: "Se eliminó correctamente" }])

        return res.redirect("/");

    } catch (error) {

        req.flash("mensajes", [{ msg: error.message }])

        return res.redirect("/");

    }

}

//creamos metodo para editar desde otro formulario.
const editarUrlForm = async (req, res) => {

    const { id } = req.params;

    try {

        //vamos a consultar a la BD
        const urlEdit = await Url.findById(id).lean()

        if (!urlEdit.user.equals(req.user.id)) {//preguntamos si el id del reques.user del usuario no es igual al del usuario del schema Url le mandamos un mensaje de error.

            throw new Error("No se puedo editar la Url");

        }

        return res.render("home", { urlEdit });

    } catch (error) {

        req.flash("mensajes", [{ msg: "No se puedo editar la Url" }])

        return res.redirect("/");

    }

}

//metodo para editar la Url
const editarUrl = async (req, res) => {

    const { id } = req.params
    const { origin } = req.body;

    try {

        const urlEdit = await Url.findById(id); //con esto vamos a tener la url que le corresponde a ese usuario

        if (!urlEdit.user.equals(req.user.id)) {//preguntamos si el id del reques.user del usuario no es igual al del usuario del schema Url le mandamos un mensaje de error.

            throw new Error("No se puedo editar la Url");

        }

        await urlEdit.updateOne({ origin }); // una vez que pase todas las validaciones lo actualizamos. Este metodo de mongoose recibe lo que nosotros vamos a editar que es la propiedad origin.

        req.flash("mensajes", [{ msg: "Url editada" }])

        res.redirect("/"); // y lo redireccionamos al home


        // await Url.findByIdAndUpdate(id, { origin })

    } catch (error) {

        req.flash("mensajes", [{ msg: error.message }])

        return res.redirect("/");

    }

}

//metodo de redireccionamiento
const redireccionamiento = async (req, res) => {

    const { shortURL } = req.params;


    try {
        //creamos una constante en la vamos a usar el metodo findOne para pasarle por que parametro queremos buscar 
        const url = await Url.findOne({ shortURL })

        if (!url?.origin) {
            throw new Error("Error no existe la Url");
        }
        res.redirect(url.origin);

    } catch (error) {
        req.flash("mensajes", [{ msg: error.message }])

        return res.redirect("/");
    }

}



//lo vamos a exportar como objetos ya que van ahcer varios.
module.exports = {
    leerUrls,
    agregarUrl,
    eliminarUrl,
    editarUrlForm,
    editarUrl,
    redireccionamiento,

}

