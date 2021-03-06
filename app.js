const express = require('express')
const fileUpload = require('express-fileupload')
fs = require('fs');
const dotenv = require('dotenv').config();
var nodemailer = require('nodemailer')
var cors = require('cors')
const bodyParser = require('body-parser');
var parser = require('xml2json');
const app = express()
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(cors())
//-----objeto para manejar el envio de correos
let transport = nodemailer.createTransport({
  service: 'gmail',
  port: 2525,
  secure: false,
  auth: {
    type: "login",
    user: 'credenciales@gmail.com',
    pass: 'password'  //-activar el acceso de aplicaciones no seguras a su cuenta de google
  }  
})


var oracledb = require('oracledb');
const { Console } = require('console');
var config = {
    user: 'Test', // nombre de usuario
    password: '1234', // contraseña

    connectString: '172.17.0.2:1521/ORCL18'
};


app.post('/insertar', async function (req, res) {

   console.log("hola")     
    try {
        var conexion = await oracledb.getConnection(config)
        console.log(conexion)

        sql = `INSERT INTO Departamentos  (depto_id, nombre,localidad) VALUES (:1, :2, :3)`;

        binds = [
            [101, "USAC", "Norte"],  
            [102, "DEL VALLE", "Norte"],
            [103, "MARROQUIN", "Norte"]
        ];

        // For a complete list of options see the documentation.
        options = {
            autoCommit: true,

            bindDefs: [
                { type: oracledb.NUMBER },
                { type: oracledb.STRING, maxSize: 20 },
                { type: oracledb.STRING, maxSize: 20 }
            ]
        };

        result = await conexion.executeMany(sql, binds, options);
        
        console.log("Numero de filas insertadas:", result.rowsAffected);
        res.send(JSON.stringify(result));
    } catch (error) {
        res.send("error" + error);
    }

});

app.post('/insertareact', async function (req, res) {

    console.log("hola")     
     try {
          console.log(req.body.correo);
          console.log(req.body.usuario);
       
          res.status(200).send({correo:req.body.correo, usuario: req.body.usuario});
     } catch (error) {
         res.send("error" + error);
     }
 
 });
 
app.post('/insertar2', async function (req, res) {


    try {
        var conexion = await oracledb.getConnection(config)
        console.log(conexion)

        sql = `INSERT INTO Departamentos  (depto_id, nombre,localidad) VALUES (:1, :2, :3)`;

        binds = [
            [101, "Amatitlan", "Norte"]
        ];

        // For a complete list of options see the documentation.
        options = {
            autoCommit: true,

            bindDefs: [
                { type: oracledb.NUMBER },
                { type: oracledb.STRING, maxSize: 20 },
                { type: oracledb.STRING, maxSize: 20 }
            ]
        };

        result = await conexion.executeMany(sql, binds, options);
        
        console.log("Numero de filas insertadas:", result.rowsAffected);
        res.send(JSON.stringify(result));
    } catch (error) {
        res.send("error" + error);
    }

});

app.post('/insertarbody', async function (req, res) {


    try {
        var conexion = await oracledb.getConnection(config)
        console.log(req.body)

        sql = `INSERT INTO Departamentos  (depto_id, nombre,localidad) VALUES (:1, :2, :3)`;

        binds = [
            [req.body.id, req.body.nombre, req.body.localidad]
        ];

        // For a complete list of options see the documentation.
        options = {
            autoCommit: true,

            bindDefs: [
                { type: oracledb.NUMBER },
                { type: oracledb.STRING, maxSize: 20 },
                { type: oracledb.STRING, maxSize: 20 }
            ]
        };

        result = await conexion.executeMany(sql, binds, options);
        
        console.log("Numero de filas insertadas:", result.rowsAffected);
        res.send(JSON.stringify(result));
    } catch (error) {
        res.send("error" + error);
    }

});

app.get('/obtener', async function (req, res) {


    try {
        var conexion = await oracledb.getConnection(config)
        console.log(conexion)
        var result = await conexion.execute("SELECT * FROM DEPARTAMENTOS")
        console.log(result.metaData);
        console.log(result.rows);
        conexion.close();
        res.send(JSON.stringify(result.rows));
    } catch (error) {
        res.send("error");
    }

});


//--para subir un archivo al servidor

app.use(fileUpload())


app.post('/upload', (req, res) => {
    console.log("entre")
    let EDFile = req.files.file
    EDFile.mv(`./files/${EDFile.name}`, err => {
        if (err) return res.status(500).send({ message: err })

        return res.status(200).send({ message: 'File upload' })
    })
})

//--este metodo carga al servidor el archivo en xml y lo castea a json
app.post('/subirxml', (req, res) => {

    let EDFile = req.files.file
    // let buffer= base64_encode(EDFile);
    console.log(EDFile)
    fs.readFile(EDFile.name, "utf8", function (err, data) {
        if (err) return res.status(500).send({ message: err })

        //---aqui se convierte en un archivo JSON pero solo texto
        var json = parser.toJson(data);
        console.log("to json ->", json);

        console.log("OBJETO\n");
        //---AHORA AQUI EL TEXTO LO VUELVO OBJETO
        console.log("to json ->", JSON.parse(json));
        let array = JSON.parse(json)
        array["departamentos"]["page"].forEach(element => {
            console.log(element["title"])
        });
        return res.status(200).send({ message: 'File upload' })
    });


})

app.post('', (req, res) => {

});

//-------END POINT CORREO
app.post('/enviarcorreo', async function(req, res) {
    
    const message = {
        from: 'correo@gmail.com', // direccion que colocaron en el transport
        to: 'destinario@gmail.com',         // direccion a la que van a enviar el correo
        subject: 'PRUEBA CORREO', // asunto del correo
        text: 'HOLA TE INVITO A APLICAR A LA VACANTE OFICINISTA ' // contenido
    };

    transport.sendMail(message, function(err, info) {
        if (err) {
          console.log(err)
        } else {
          console.log(info);
        }
    });
});

//--para convertir en base64
function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
}



app.listen(5000, () => console.log('Corriendo'))