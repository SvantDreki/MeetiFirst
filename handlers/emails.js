const nodemailer = require('nodemailer');
const emailConfig = require('../config/emails');
const fs = require('fs');
const util = require('util');
const ejs = require('ejs');

let transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    secure: false,
    auth: {
      user: "a0f24a36c32ce0",
      pass: "72957f74e960ad"
    }
  });

exports.enviarEmail = async (opciones) => {
    
    //Leer el archivo para el mail 
    //__dirname retorna la url en la que estoy posicionado(./handlers/emails.js)
    const archivo = __dirname + `/../views/emails/${opciones.archivo}.ejs`; 
    
    //Compilarlo
    //ejs.compile me retorna la variables que posea el archivo
    //para leerlas es necesario fs.readFileSync 
    const compilado = ejs.compile(fs.readFileSync(archivo, 'utf-8'));
    
    //Crear el html
    const html = compilado({ url: opciones.url });

    //configurar las opciones del mail
    const opcionesEmail = {
        from: 'Meeti <noreply@meeti.com>',
        to: opciones.usuario.nombre,
        subject: opciones.subject,
        html
    };

    //enviar mail
    const sendEmail = util.promisify(transport.sendMail);
    return sendEmail.call(transport, opcionesEmail); 
    
};