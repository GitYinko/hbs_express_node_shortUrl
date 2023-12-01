// como estamos utilizando el modelo vista controlador

//aqui vamos a tener toda la logica de los metodos CRUD del home


// importamos el model
const Url = require("../models/Url");

const { nanoid } = require("nanoid");


//vamos a crear un metodo para leer 
const leerUrls = async (req, res) => {

    console.log(req.user)

    //vamos a leer los datos de BD
    try {
        //creamos a una constante en la que esperamos el modelo Url y vamos a leer esa informacion mediante el metodo find y como quremos traer toda la informacion y no filtrarla, llamamos a lean que nos transforma el array de objetos de mongoose que seria como objetos que nos permite hacer mas cosas pero hbs no lo lee por lo tanto "lean" nos transforma esos objetos a los tradicionales de javaScript.
        const urls = await Url.find().lean()

        res.render("home", { titulo: "Pagina principal 👋", urls })

    } catch (error) {

        console.log(error)
        res.send("Ops hubo un problema")

    }

}

//creamos metodo para agregar. 
const agregarUrl = async (req, res) => {

    const { origin } = req.body;


    //llamamos al modelo
    const url = new Url({ origin, shortURL: nanoid(8) });//le pasamos el largo de ese nanoid 

    try {

        //lo enviamos a la BD
        await url.save();

        //y lo volvemos a la pagina de inicio.
        res.redirect("/");


    } catch (error) {

        console.log(error)
        res.send("fallo")

    }


}

//creamos metodo para eliminar una url. usamos async ya que vamos hacer una solisitud
const eliminarUrl = async (req, res) => {

    //capturamos el id del parametro de la ruta 
    const { id } = req.params;

    try {

        //y con el metodo findByIdAndDelete lo eliminamos que lo que hace este metodo es buscar por id y eliminarlo.
        await Url.findByIdAndDelete(id);

        res.redirect("/");

    } catch (error) {

        console.log(error)
        res.send("fallo")

    }

}

//creamos metodo para editar desde otro formulario.
const editarUrlForm = async (req, res) => {

    const { id } = req.params

    try {

        //vamos a consultar a la BD
        const urlEdit = await Url.findById(id).lean()

        res.render("home", { urlEdit });

    } catch (error) {

        console.log(error)
        res.send("fallo")

    }

}

//metodo para editar la Url
const editarUrl = async (req, res) => {

    const { id } = req.params
    const { origin } = req.body;

    try {

        await Url.findByIdAndUpdate(id, { origin })
        res.redirect("/")

    } catch (error) {

        console.log(error)
        res.send("fallo")

    }

}

//metodo de redireccionamiento
const redireccionamiento = async (req, res) => {

    const { shortURL } = req.params;


    try {
        //creamos una constante en la vamos a usar el metodo findOne para pasarle por que parametro queremos buscar 
        const url = await Url.findOne({ shortURL })

        if (!url?.origin) {
            return res.send("error no existe el redireccionamiento");
        }
        res.redirect(url.origin);

    } catch (error) {
        console.log(error);
    }

}



//lo vamos a exportar como objetos ya que van ahcer varios.
module.exports = {
    leerUrls,
    agregarUrl,
    eliminarUrl,
    editarUrlForm,
    editarUrl,
    redireccionamiento

}