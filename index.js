//todo estos archivos son parte del backend ecepto lo que esta en la carpeta public eso pertenece al front-end.
// console.log("hola desde el backend")


//exportaciones
const express = require("express");
const { create } = require("express-handlebars");


//creamos el servidor.
const app = express();

const port = 5000;

app.listen(port, () => console.log("Funcionando 🚀"))


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



//middleware para exponer una ruta raiz que va hacer publica, tambien archivos que son estaticos. Todo lo que este es esa carpeta se expone.
app.use(express.static(__dirname + "/public"));//le decimos con dirname que busque la carpeta public en este directorio.

//vamos a usar otro middleware para llamar a las ruta raiz del directorio routes y poder acceder a los archivos que continen las configuraciones de las petisiones http.
app.use("/", require("./routes/home"));
app.use("/auth", require("./routes/auth"));








// Instalamos el paquetito o dependencia "npm i express-handlebars "para utilizar motores de plantillas, es decir, que es para hacer un archivo html dinamico en el que si tenemos varias estructuras html solo tengamos que vincularla en un solo archivo principal.

//como vamos a trabajar con archivos hbs, nodemon no los detecta, por lo tanto no se va a reiniciar el servidor. asi que vamos a crear un archivo "nodemon.json" para configurara los formatos de archivos en lo que vamos a trabajar.