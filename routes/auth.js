const express = require("express"); //Inicializamos express

const router = express.Router(); //vamos a trabajar con router express


router.get("/login", (req, res) => {
    res.render("login")
})

module.exports = router;