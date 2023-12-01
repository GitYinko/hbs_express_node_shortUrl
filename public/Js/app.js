//esto vive en front-end

console.log("saludos desde el front-end")


//hacemos nuestra delegacion de eventos
document.addEventListener("click", (e) => {

    const { short } = e.target.dataset


    if (short) {

        const url = `http://localhost:5000/${short}`;

        //y hacemos el metodo para copiar en el porta papeles
        navigator.clipboard
            .writeText(url)
            .then(() => {

                console.log("Texto copiado")

            })
            .catch((err) => {

                console.log("Ocurrio un erro", err)

            })

    }

})