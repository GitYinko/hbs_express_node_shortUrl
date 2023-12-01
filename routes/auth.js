const express = require("express"); //Inicializamos express

const { body } = require("express-validator"); //llamamos al paquete "express-validator" y llamamos a body que nos va a permitir hacer las validaciones ya que trae en el viaja el cuerpo del mensaje.

const {
    loginForm,
    registerForm,
    registerUser,
    confirmarCuenta,
    loginAcceso,
    cerrarSesion } = require("../controllers/authController");


const router = express.Router(); //vamos a trabajar con router express


//vamos a usar un paquetito para validar los campos del formulario que se llama "express validator".



//rutas del register
router.get("/register", registerForm)//para ver el formulario
router.post("/register", [

    body("userName", "Ingrese un nombre")//como primer parametro toma el name del input del form register, como segundo el mensaje que queremos enviar y depues llamamos los metodos para validar segun necesidad.
        .trim()//saca los caracteres en blanco 
        .notEmpty()//para decirle que no venga vacio.
        .escape()//para que solo mande caracteres.
    ,
    body("email", "Ingrese un email valido")
        .trim()
        .isEmail()//validar si cumple con un formato email.
        .normalizeEmail()
    ,
    body("password", "Contraseña de almenos 6 carácteres")
        .trim()
        .isLength({ min: 6 }) //validamos la longitud de carácteres del contraseña
        .escape()
        //hacemos una validacion personalizada para validar que password y repassword coinsidan.
        .custom((value, { req }) => { //recibe una funcionde callback que a su vez recibe dos params, el value que vamos a evaluar y accedemos al reques para poder accder al body y obtener las llaves del los input del form.

            if (value !== req.body.repassword) {
                throw new Error("Las contraseñas no coinciden")
            }
            else {
                return value;
            }

        })



], registerUser)//registramos los usuarios, pero antes de registrar le vamos hacer un par de validaciones ya que en el verbo post es donde se hacen por que es donde recibimos los datos. hacemos un array de validaciones por que puede haber mas de una


router.get("/confirm/:token", confirmarCuenta) //ruta de confirmacion, donde vamos a leer el token que le enviamos al ausuario para saber si esta confirmda. Este token se comporta como una variable en la que va almacenar el token.


//rutas del login
router.get("/login", loginForm)
router.post("/login", [

    body("email", "Ingrese un email valido")
        .trim()
        .isEmail()//validar si cumple con un formato email.
        .normalizeEmail()
    ,
    body("password", "Contraseña incorrecta")
        .trim()
        .isLength({ min: 6 }) //validamos la longitud de carácteres del contraseña
        .escape()

], loginAcceso)


//rutas para cerrar sesion
router.get("/logout", cerrarSesion); //cada vez que se vicite esta ruta se cerra sesion.


module.exports = router;