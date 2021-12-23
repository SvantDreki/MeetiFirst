const Usuarios = require("../models/Usuarios");
const { check, validationResult } = require('express-validator');
const { sanitizeBody } = require('express-validator');
//const enviarEmail = require('../handlers/emails');
const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs');

const configuracionMulter = {
    limits: {fileSize: 100000},
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, next) => {
            next(null, __dirname+'/../public/uploads/perfiles/');
        },
        filename : (req, file, next) => {
            const extension = file.mimetype.split('/')[1];
            next(null, `${shortid.generate()}.${extension}`);
        }
    }),
    fileFilter(req, file, next) {
        if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' ) {
            //El formato es valido
            next(null, true);
        } else {
            //El formato no es valido
            next(new Error('Formato no válido'), false);
        }
    }
}

const upload = multer(configuracionMulter).single('imagen');

exports.formCrearCuenta = (req, res) => {
    res.render('crear-cuenta', {
        nombrePagina: 'Crea tu Cuenta'
    });
}

exports.crearNuevoCuenta = async (req, res, next) => {
    const usuario = req.body;

    const rules = [
        check('confirmar').notEmpty().withMessage('El password de confirmacion no puede ir vacio').escape(),
        check('confirmar').equals(req.body.password).withMessage('El password es diferente').escape()
    ];
    

    //Ejecutar validaciones
    await Promise.all(rules.map(validation => validation.run(req)));

    //Leer los errores
    const erroresExpress = validationResult(req);
    const erroresExp = erroresExpress.array();
        try {

            const usuarioRegis = await Usuarios.findOne({
                where: {
                    email: usuario.email
                }
            });
            
            if(usuarioRegis) {
                req.flash('error', 'Usuario ya Registrado');
                if(erroresExp.length) {
                    erroresExp.forEach(err => {
                        req.flash('error', err.msg);
                    });
                    
                    return  res.redirect('/crear-cuenta');
                }
            }
            
            
            await Usuarios.create(usuario);

            /*
            //url de confirmacion
            const url = `http://${req.headers.host}/confirmar-cuenta/${usuario.email}`;

            //Enviar el email de confirmacion
            await enviarEmail.enviarEmail({
                usuario,
                url,
                subject: 'Confirma tu cuenta de Meeti',
                archivo: 'confirmar-cuenta'
            });
             req.flash('exito', 'Hemos enviado un email, confirma tu cuenta');
            */

            req.flash('exito', 'Tu cuenta ha sido creada');
            res.redirect('/Iniciar-sesion');
        } catch (error) {
           console.log(error);
            //Errores de sequelize
            const sequelizeErrors = error.errors.map(err => err.message);
           
            //Errores de express-validator
            const errExp = erroresExp.map(err => err.msg);
    
            //Unir los errores
            const listaErrores = [...sequelizeErrors, ...errExp];
            
            req.flash('error', listaErrores);
            res.redirect('/crear-cuenta');
        } 
    
}

exports.formIniciarSesion = (req, res) => {
    res.render('iniciar-sesion', {
        nombrePagina: 'Iniciar Sesión'
    });
};

exports.formEditarPerfil = async (req, res, next) => {
    const usuario = await Usuarios.findOne({
        where: {
            id: req.user.id
        }
    });

    if(!usuario) {
        req.flash('error', 'Operación no Válida');
        res.redirect('/iniciar-sesion');
        next();
    }

    res.render('editar-perfil', {
        nombrePagina: `Editar Perfil: ${usuario.nombre}`,
        usuario
    });
}

exports.editarPerfil = async (req, res) => {

    const usuario = await Usuarios.findByPk(req.user.id);

    sanitizeBody('nombre');
    sanitizeBody('email');

    const { nombre, descripcion, email} = req.body;

    usuario.nombre = nombre;
    usuario.descripcion = descripcion;
    usuario.email = email;

    await usuario.save();
    req.flash('exito', 'Cambios Guardados Correctamente');
    res.redirect('/administracion');

}

exports.formCambiarPassword =  (req, res) =>{
    res.render('cambiar-password', {
        nombrePagina: 'Cambiar Password'
    });
}

exports.cambiarPassword = async (req, res, next) => {

    const usuario = await Usuarios.findByPk(req.user.id);

    //Verificar el password anterior sea correcto
    if(!usuario.validarPassword(req.body.actual)) {
        req.flash('error', 'El password es incorrecto');
        res.redirect('/administracion');
        return next();
    }

    //si el password es correcto, hashear el nuevo
    const hash = usuario.hashPassword(req.body.nuevo);

    //asignar el password nuevo al usuario
    usuario.password = hash;

    //guardar en la BD
    await usuario.save();

    //Redireccionar
    req.logout();
    req.flash('exito', 'Cambios Guardados Correctamente, Vuelve a iniciar sesión');
    res.redirect('/iniciar-sesion');
}

exports.formImagenPerfil = async (req, res) => {
    
    const usuario = await Usuarios.findByPk(req.user.id);

    res.render('imagen-perfil', {
        nombrePagina: `Imagen de Perfil: ${usuario.nombre}`,
        usuario
    });

    
}

exports.subirImagen = (req, res, next) => {
    upload(req, res, function(error) {
        if(error) {
            if(error instanceof multer.MulterError) {
                if(error.code === 'LIMIT_FILE_SIZE') {
                    req.flash('error', 'El Archivo es muy grande')
                } else {
                    req.flash('error', error.message);
                }
            } else if(error.hasOwnProperty('message')) {
                //hasOwnProperty revisa si es que error tiene la propiedad message
                req.flash('error', error.message);
            }
            res.redirect('back');
            return;
        } else {
            next();
        }
    });
}

exports.imagenPerfil = async (req, res, next) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    if(!usuario) {
        req.flash('error', 'Operación no Válida');
        res.redirect('/iniciar-sesion');
        return next();
    }

    if(req.file && usuario.imagen) {
        const imagenGuardada = `${__dirname}/../public/uploads/perfiles/${usuario.imagen}`;
        fs.unlink(imagenGuardada, (error) => {
            if(error){
                console.log(error);
            }
        });
    }

    if(req.file) {
        usuario.imagen = req.file.filename;
    }

    await usuario.save();
    req.flash('exito', 'Cambios almacenados Correctamente');
    res.redirect('/administracion');
}