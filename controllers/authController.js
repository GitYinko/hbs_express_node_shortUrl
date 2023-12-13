
//aqui vamos a tener los metodos de la autenticacion

//exportamos el modelo. es una exportacion por defecto.
const User = require("../models/User");

//exportamos nanoid
const { nanoid } = require("nanoid")

//vamos a exportar el metodo de express validator para que podamos visualizar esos mensajes de error que configuramos en las rutas.
const { validationResult } = require("express-validator")

//exportamos nodemailer par enviar correos electronicos
const nodemailer = require("nodemailer");

require("dotenv").config();//para traer nuestras variables de entorno


//metodo para renderizar el vista del formulario register
const registerForm = (req, res) => {

    res.render("register"); // envimaos los mensajes flash con los errores del catch atravez de la variable locals.

}

//metodo para capturar los datos del formulario, guardarlos en la BD. como vamos a trabajar con BD vamos a usar async y await
const registerUser = async (req, res) => {

    //vemos los valores en la consola 
    // console.log(req.body)

    //vemos los valores en el navegador en formato json.
    // res.json(req.body);


    //aqui vamos a registrar los errores segun las validaciones configuradas.
    const errors = validationResult(req);//recibe el requerimiento o consulta

    //si el error no esta vacio le pintamos el mensaje de error.
    if (!errors.isEmpty()) {

        req.flash("mensajes", errors.array())

        return res.redirect("/auth/register");

    }


    //hacemos una destructuracion de todo lo que viene del body
    const { userName, email, password } = req.body;

    try {


        //vamos a verificar si ese ususario existe en nuestra BD, y para ello llamamos al modelo User. vamos a buscar con el metodo findOne y vamos a buscar el usuario si es que coincide el email.
        let user = await User.findOne({ email })

        //si el usuario ya existe le mandamos un mensaje de error 
        if (user) throw new Error("Ya existe el usuario.") // este throw new Error hace que salte al catch si entra a este if, es decir, que el mensaje del error vieja al error.message del catch.

        //vamos hacer una instancia de nuestro schema y vamos a usar esa instancia. y se va a instanciar solo lo que esta en el schema y no cosas que no existan como por ejemplo "rol" 
        user = new User({ userName, email, password, tokenConfirm: nanoid(), rol: "administrador" })

        //ahora accedemos al metodo save()para guardar los datas en la BD, por que cuando nosotros hicimos esa nueva instancia pasamos esas propiedades y metodos de mongoose
        await user.save();


        //ENVIAR LA INFORMACION AL CORREO DEL USUARIO.
        const transport = nodemailer.createTransport({ //esta es la configuracion que necesita nodemailer
            host: "sandbox.smtp.mailtrap.io",
            port: 2525,
            auth: {
                user: process.env.USEREMAIL,
                pass: process.env.PASSEMAIL
            }
        });

        //aqui es donde configuramos el envio del email
        await transport.sendMail({

            from: '"Fred Foo 👻" <foo@example.com>', // sender address / dirección del remitente

            to: user.email, // list of receivers / lista de receptores

            subject: "Hola ✔erifique su cuenta de ShortUrl", // Subject line / Línea de asunto

            //puede ser un mensaje en texto o en cuerpo html, en nuesto caso lo hacemos en formato html ya que necesitamos de un ancla para verificar la cuenta.
            html: `<a href= "${process.env.PATHHEROKU}/auth/confirm/${user.tokenConfirm}" >Verifica tu cuenta aquí</a>`, // html body /cuerpo html 

            // text: "Hello world?", // plain text body / cuerpo de texto plano
        });

        //AQUI ENVIAMOS MENSAJE QUE RECIBIO CORREO PARA CONFIRMACON LA CUENTA.
        req.flash("mensajes", [{ msg: "Revise sú correo electronico para confirmar la cuenta. Gracias!" }]);

        // res.json(user);

        res.redirect("/auth/login");

    } catch (error) {

        req.flash("mensajes", [{ msg: error.message }])

        return res.redirect("/auth/register");

    }

}

const confirmarCuenta = async (req, res) => {

    //para leer parametros que vienen de una url usamos "params"
    const { token } = req.params;

    try {

        //vamos a verificar la BD para saber si existe el token que esta mandando el ususario para confirmar la cuenta.
        const userToken = await User.findOne({ tokenConfirm: token }) // siempre va el await cuando estamos esperando la consulta de user.

        //en caso de que se encuentre el token que envia el usuario en nuestra BD, HACEMOS UNAS VALIDACIONES.

        //Si el token no existe hacemos que salte al catch que le deje un mensaje de error
        if (!userToken) throw new Error("No existe este usuario")

        //pero encaso de que ese usuario exista nosotros tenemos que modificarlo, cambiando el valor booleano de la propiedad "confirm" en true para confirmale la cuenta.
        userToken.confirm = true;

        //y proseguimos a volver el valor por defecto en null de la propiedad "tokenConfirm" para que no haya colapso.
        userToken.tokenConfirm = null;

        //una vez que este todo OK proseguimos a guardarlo
        await userToken.save();


        req.flash("mensajes", [{ msg: "Cuenta confirmada correctamente. Puedes iniciar sesion" }])


        res.redirect("/auth/login");


    } catch (error) {

        req.flash("mensajes", [{ msg: error.message }])

        res.redirect("/auth/login")

    }


}

//metodo get para renderizar el formulario login
const loginForm = (req, res) => {

    // res.render("login", { mensajes: req.flash("mensajes") }) // cuando no se cumpla una validacion, la constante errors va a recibir el mensaje de error para enviarle al usuario, es decir, que pinta el error en el form.

    res.render("login")

}

//metodo para iniciar sesion 
const loginAcceso = async (req, res) => {


    //aqui vamos a registrar los errores segun las validaciones configuradas.
    const errors = validationResult(req);//recibe el requerimiento o consulta

    //si el error no esta vacio le pintamos el mensaje de error.
    if (!errors.isEmpty()) {

        //vamos a usar el flash para enviar el mensaje del error al usuario.
        req.flash("mensajes", errors.array())//recibe la key del mensaje y le mandamos los errores en formato array para que sea un array de objetos y poder acceder a sus propiedades que capturamos con las validaciones.

        return res.redirect("/auth/login"); // y lo redireccionamos al login enviando los mensajes flash.

    }


    //vamos a sacar de body el email y password para confirmar que existe el usuario.
    const { email, password } = req.body;

    try {

        //vamos a verificar que existe el usuario mediante el metodo "findOne" en el email
        const userLogin = await User.findOne({ email })

        //HACEMOS UN PAR DE VALIDACIONES

        //En caso de que no exista hacemos que salte al catch con un mensaje de error
        if (!userLogin) throw new Error("No existe este email");

        //ahora preguntamos que si el token fue confirmado o no, en caso de que no este confirmado hacemos que salte al catch con un mensaje de error.
        if (!userLogin.confirm) throw new Error("Cuenta no confirmada");

        //ahora si el email existe y la cuenta fue confirmada, pasamos a validar el password, comparando las contraseña de la BD con la que ingresa el usuario llamando al metodo "comparePassword" que creamos en el modelo schema que va a recibir la contraseña que envia el usuario.
        if (!(await userLogin.comparePassword(password))) {
            throw new Error("Contraseña incorrecta");
        }

        // esta operacion está creando la sesión de usuario a travez de passport y su metodo login.
        req.login(userLogin, function (err) {

            if (err) throw new Error("Error al crear session");

            //una vez que paso todas las validaciones es por que la cuenta del usuario es correcta y proseguimos a enviarlo a la pagina principal.
            return res.redirect("/");

        });

    } catch (error) {

        req.flash("mensajes", [{ msg: error.message }]) //usamos el flash para pintar los errores de las validaciones provenientes de la BD que van a estar en "error.message" que almacena los mensajes que vienen de "throw new Error()" y lo enviamos al array de objetos en la propiedad "msg"

        return res.redirect("/auth/login");

    }

}

//metodo para cerrar sesion
const cerrarSesion = (req, res, next) => {

    //llamamos al reques.logout que es un metodo de passport para cerrar sesion
    req.logout((err) => { //este metodo espara una funcion de callback

        if (err) { return next(err); }

        //y luego lo redireccionamos al login
        return res.redirect("/auth/login");

    });

};



module.exports = {

    registerForm,
    registerUser,
    confirmarCuenta,
    loginForm,
    loginAcceso,
    cerrarSesion

}

//Instalamos un paquete llamdo "Nodemailer" es un módulo para aplicaciones Node.js que permite el envío de correos electrónicos de forma muy sencilla

//Tambien vamos a instalar un paquete llamado "MailTrap" lo que hace es probar los envios de los correos electronicos y simula que nosotros lo estamos envaindo y que lo vamos a estar resibiendo como si fueramos el cliente. 