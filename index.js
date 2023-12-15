//todo estos archivos son parte del backend ecepto lo que esta en la carpeta public eso pertenece al front-end.
// console.log("hola desde el backend")


//exportaciones
const express = require("express");
const { create } = require("express-handlebars");
const session = require("express-session"); //importamos para poder crear sessiones.
const flash = require("connect-flash");

const mongoSanitize = require('express-mongo-sanitize');

const passport = require("passport");//importamos Passport que es un middleware de autenticación para Node.js. passport tambien trabaja con sesiones

const User = require("./models/User");

const csrf = require("csurf"); //importamos el paquete csrf que es para evaluar que los formularios sean y permanescan o que vengan de nuestro sitio web.

const cors = require("cors");

const MongoStore = require("connect-mongo"); //importamos connect mongo 

//Hacemos que el index lea nuestra variable de entorno y usamos "dotenv" que es para gestionar nuestro archivo .env
require("dotenv").config();

//Hacemos que el index lea la conexion de la BD
const clientDB = require("./database/db")
// require("./database/db");



//creamos el servidor.
const app = express();

//LLAMAMOS A LA VARIABLE DE ENTORNO con el process.env y le pasamos un puerto que tengamos en la variable de entorno y si no exixte esa env le decimos que ocupe el puerto 5000.
const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log("Funcionando desde el puerto ✨ " + PORT))


//con estas configuraciones ya podemos usar nuestros sistemas de motores de plantillas (template engine)

//vamos a cambiar el nombre de la extension "hanledbars" por "hbs" y que trabajes con partials(que es separa estructuras o pedasitos de bloques html y llevarlos a otros archivos html.)
const hbs = create({ // este create va a recibir las configuraciones de express-handlebars

    extname: ".hbs", // y le decimos que la extencion va a ser hbs.

    partialsDir: ["views/components"]//le indicamos la ubicacion de los partials/ componentes.

});

//configuraciones que toma express
app.engine(".hbs", hbs.engine); //nuestro motor de plantilla 
app.set("view engine", ".hbs"); // la extension que es .hbs
app.set("views", "./views");// que va a estar dentro de la carpeta views
app.set("trust proxy", 1);//hace que nuestro secure de nuestro session funcione si le pasamos una varible de entorno


//CONFIGURACIONES DE MIDDLEWARE

//configuracion para el CORS
const corsOptions = {

    credentials: true, //aqui estamos mandando credenciales dentro nuestro servidor

    origin: process.env.PATHRAILWAY, // aqui vamos a configurar para saber cual es la url de raidway.

    methods: ['GET', 'POST'], // aqui solo pasamos los metodos que estamos utilizando, para que solo se usen estos.

}

//vamos a crear otro middleware con CORS para permitir a los servidores indicar a los navegadores si deben permitir la carga de recursos para un origen distinto al suyo (dominio, esquema o puerto)
app.use(cors(corsOptions))


//usamos el middleware para crear sessiones
app.use(session({ //contiene configuraciones

    secret: process.env.SESSIONSECRET,//es para darle seguridad a la session
    resave: false,//para volver a guardar
    saveUninitialized: false,//para autoguardar
    name: "session-user", // se coloca algun name para no ocupar el name por defecto
    store: MongoStore.create({ //le informamos donde se encuatra nuestra conxion de BD, porque create()? por que esto va a recibir configuraciones.
        clientPromise: clientDB, //por que el clientDB me trae una promesa
        dbName: process.env.DBNAME, // le incorporamos el nombre de la BD.

    }),

    cookie: {
        secure: true, // va a esperar solo petisiones https, pero cuando estamos en produccion localhost es http por lo tanto no funcionario y tendria que estar en false.
        maxAge: 30 * 24 * 60 * 60 * 1000 // esto cuanto va a durar la session.
    }, //le agregamos seguridad a nuestra session

}))//ya con esto podemos crear sessiones en nuestro sito web



//hagamos un ejemplo practico para ver como funciona SESSION

//aqui vamos a verificar si el usuario esta autenticado o no mediate session
// app.get("/rutaProtegida", (req, res) => {

//     res.json(req.session.usuario || "Sin session de usuario");//vemos si existe una session en la ruta "/rutaProtegida", atravez del req vamos a poder tener informacion

// })

// //ahora vamos a crear esa session. vamos a imaginar que el siguiente codigo es un login.
// app.get("/crear-session", (req, res) => {

//     req.session.usuario = "EmaCrossa"; //creamos la session.
//     res.redirect("/rutaProtegida");// y despues lo redireccionamos.

// })

// //tambien podemos hacer una ruta para destruir la session
// app.get("/destruir-session", (req, res) => {

//     req.session.destroy();
//     res.redirect("/rutaProtegida");
// })

//la session la esta almacenando en la memoria que tiene express en la nuestra pc, pero esto no es recomendable, lo recomendable es almaceanrlo en la BD como puede ser mongo con "connect-mongo".
//SI nuestro servidor se reinicia se pierde la session de usuario.


app.use(flash())//usamos el middleware para crear flash que nos sirve para enviar alertas al usuaurio.

//hagamos un ejemplo practico para ver como funciona FLASH

// app.get("/mensaje-flash", (req, res) => { // esta es la ruta que va a recibir el mensaje por ejemplo la ruta del login, home.

//     res.json(req.flash("mensaje")); // mandamos un mensaje flash "mensaje" seria la key.

//     //nota solo se tiene que ejecutar una vez.

// })

// //ahora atravez de otra ruta le vamos a enviar el mensaje
// app.get("/crear-mensaje", (req, res) => {

//     req.flash("mensaje", "este es un mensaje flash") //creamos el mensaje, que recibe la key y el mensaje.

//     res.redirect("/mensaje-flash");

// })


//inicializamos el middleware de passport para autenticar
app.use(passport.initialize())//inicializamos
app.use(passport.session())//y decimos que passport tambien trabaje con sessiones

//vamos a establecer una sesion para almacenar la informacion del usuario que nos la va a proporccionar el metodo serializeUser de passport
passport.serializeUser((user, done) => done(null, { id: user._id, userName: user.userName })) // este metodo recibe el usuario y un done donde vamos a guardar la session, le decimos que no hay errores con null y en un objeto le pasamos lo que se va a ir al reques.user que son las propiedades de nuestro modelo.


//pero cada vez que se refresque el sitio web y se necesite actualizar la sesion vamos a tenener el metodo deserializeUser. que va a mantener la sesion almenson que se reinicie el servidor.
passport.deserializeUser(async (user, done) => {

    //verificamos que el usuario exista en la DB
    const userDB = await User.findById(user.id).exec();

    //Y retornamos la promesa done 
    return done(null, { id: userDB._id, userName: userDB.userName })

})


//middleware para exponer una ruta raiz que va hacer publica, tambien archivos que son estaticos. Todo lo que este es esa carpeta se expone.
app.use(express.static(__dirname + "/public"));//le decimos con dirname que busque la carpeta public en este directorio.

app.use(express.urlencoded({ extended: true })); // middleware para leer datos que viene de un formulario.


//middleware de CSRF que vamos a estar habilitando todas las protecciones a los formulario, esto seria como un token para los formularios en el que tenemops que configurar el los formularios provengan de una parte segura del sitio web para no ser hackeados.Por lo tanto , de una forma hay que enviar ese token a los formularios.
app.use(csrf());

//vamos a configurar nuestro propio middleware para enviar el token a los formulario de forma dinamica. para no estar configurando en cada formulario.
app.use((req, res, next) => {

    // variables locales
    res.locals.tokenCsrf = req.csrfToken(); //con este metodo de csrf sirve para cada vez que se renderice la pagina se nos va a enviar una llave que es la que nosotros pasemos que despues va a enviar a las vistas, es decir, los formularios. y esto viene del reques.csrfToken que es donde el middleware csrf guarda el token.

    res.locals.mensajes = req.flash("mensajes"); //ahora solo renderizamos la vista y no hace falta pasarle el objeto con el mensaje flash. ya que, con esta variable local vamos a estar enviando datos cada vez que se renderiza la pagina.

    next(); //decimos que prosiga con los metodos.

})


app.use(mongoSanitize()); //vamos a poner este middleware antes de las rutas por que va a estar leyendo el reques ya que va interferir en él y va hacer la limpieza y se encuantra algo unadecuado.



//vamos a usar otro middleware para llamar a las ruta raiz del directorio routes y poder acceder a los archivos que continen las configuraciones de las petisiones http.
app.use("/", require("./routes/home"));
app.use("/auth", require("./routes/auth"));



// Instalamos el paquetito o dependencia "npm i express-handlebars "para utilizar motores de plantillas, es decir, que es para hacer un archivo html dinamico en el que si tenemos varias estructuras html solo tengamos que vincularla en un solo archivo principal.

//como vamos a trabajar con archivos hbs, nodemon no los detecta, por lo tanto no se va a reiniciar el servidor. asi que vamos a crear un archivo "nodemon.json" para configurara los formatos de archivos en lo que vamos a trabajar.


//MONGOOSE es un motor para que podamos conectarnos en la BD que nos permite interactuar con información referida a un objeto ODM (MODELO DE DATOS ORIENTADO A OBJETOS). lo instalamos la dependencia de mongoose "npm install mongoose".


// EXPRESS SESSION: El middleware express-session almacena los datos de sesión en el servidor; a direrencia de rest que trabajamos el back separado del fron y aqui se mezcla todo. Este middleware sólo guarda el ID de sesión en la propia cookie, no los datos de sesión. De forma predeterminada, utiliza el almacenamiento en memoria del servidor y no está diseñado para un entorno de producción. almenos que lo almacenemos en mongo con" connect-mongo".

// CONNECT FLASH: El flash es un tipo de session que solo vive una vez en un área especial de la sesión que se utiliza para almacenar mensajes. Los mensajes se escriben en la memoria flash y se borran después de mostrarse al usuario. El flash generalmente se usa en combinación con redireccionamientos, lo que garantiza que el mensaje esté disponible para la siguiente página que se va a representar. que maneja sesiones por lo tanto hay que habilitar sesiones.

// CONNECT-MONGO: Nos va a servir para guardar la session deL usuario en la BD y no en memoria del servidor que puede afectar el rendimiente del sitio web.

//EXPRESS MONGOOSE SANITIZE:
// ¿Para qué sirve este módulo?
// Este módulo busca claves en objetos que comienzan con el signo $ o contienen ., de req.body, req.query o req.params. Entonces puede:
// eliminar completamente estas claves y los datos asociados del objeto, o
// reemplace los caracteres prohibidos con otro carácter permitido.

//CORS: Esto nos ayuda a bloquear solisitudes que podemos decirle que sierto dominio va a consumir nuestra pagina web. El intercambio de recursos de origen cruzado (CORS, por sus siglas en inglés), es un mecanismo basado en cabeceras HTTP que permite a un servidor indicar cualquier dominio, esquema o puerto con un origen (en-US) distinto del suyo desde el que un navegador debería permitir la carga de recursos.