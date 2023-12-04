//Hacemos este middleware para verificar si el usario tenga una session activa.

module.exports = (req, res, next) => {

    //como el req contiene ya las configuraciones de passport vamos a preguntar si en la configuracion req.isAuthenticated que va a verificar que el usuario tenga una session activa. 
    if (req.isAuthenticated()) { // si es activa le decimos que siga con el siguiente metodo
        return next();

    }
    else { //caso contrario lo redireccionamos al login.

        return res.redirect("/auth/login");

    }

}

//todas la paginas que tengan este middleware van a tener acceso a req.user
