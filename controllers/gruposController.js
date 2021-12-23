const Categorias = require('../models/Categorias');
const Grupos = require('../models/Grupos');
const { sanitizeBody } = require('express-validator');
const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');


const configuracionMulter = {
    limits: {fileSize: 100000},
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, next) => {
            next(null, __dirname+'/../public/uploads/grupos/');
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

exports.formNuevoGrupo = async (req, res) => {

    const categorias = await Categorias.findAll();

    res.render('nuevo-grupo', {
        nombrePagina: 'Crea un nuevo grupo',
        categorias
    });
}

//Almacena los datos en la BD
exports.crearGrupo = async (req, res) => {

    sanitizeBody('nombre');
    sanitizeBody('url');

    const grupo = req.body;

    grupo.usuarioId = req.user.id;
    
    /*if(req.file.size > 100000) {
        const imagenGuardada = `${__dirname}/../public/uploads/grupos/${req.file.filename}`;
        fs.unlink(imagenGuardada, (error) => {
            if(error){
                console.log(error);
            }
        });
        req.flash('error', 'El archivo es mu grande');
        return res.redirect('/nuevo-grupo');
    }*/

    if(req.file) {
        grupo.imagen = req.file.filename;
    }
     
    grupo.id = uuidv4();

    try {
        await Grupos.create(grupo);
        req.flash('exito', 'Se ha creado el grupo Correctamente ');
        res.redirect('/administracion');
    } catch (error) {
        console.log(error);
        //Errores de sequelize
        const sequelizeErrors = error.errors.map(err => err.message);

        req.flash('error', sequelizeErrors);
        res.redirect('/nuevo-grupo');
    }
}

//Sune la imagen
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

//Form de Editar Grupo
exports.formEditarGrupo = async (req, res) => {

    const consultas = [];
    consultas.push(Grupos.findByPk(req.params.grupoId));
    consultas.push(Categorias.findAll());

    //Promise con await
    const [grupo, categorias] = await Promise.all(consultas);

    res.render('editar-grupo', {
        nombrePagina: `Editar grupo: ${grupo.nombre}`,
        grupo,
        categorias
    });
    
}

exports.editarGrupo = async (req, res, next) => {

    const grupo = await Grupos.findOne({ where : {
        id: req.params.grupoId,
        usuarioId: req.user.id
    } });

    //Si no existe el grupo o no es el usuario
    if(!grupo) {
        req.flash('error', 'Operación no Válida');
        res.redirect('/administracion');
        next();
    }

    //todo bien, leer los datos
    const { nombre, descripcion, categoriaId, url } = req.body;

    //Asignar valores
    grupo.nombre = nombre;
    grupo.descripcion = descripcion;
    grupo.categoriaId = categoriaId;
    grupo.url = url;

    //Guardar los datos en la BD
    await grupo.save();
    req.flash('exito', 'Cambios almacenados Correctamente');
    res.redirect('/administracion');
}

exports.formEditarImagen = async (req, res) => {
    
    const grupo = await Grupos.findOne({ where : {
        id: req.params.grupoId,
        usuarioId: req.user.id
    } });
    res.render('editar-imagen', {
        nombrePagina: `Editar Imagen Grupo: ${grupo.nombre}`,
        grupo
    });
}

exports.editarImagen = async (req, res, next) => {
    const grupo = await Grupos.findOne({ where : {
        id: req.params.grupoId,
        usuarioId: req.user.id
    } });

    if(!grupo) {
        req.flash('error', 'Operación no Válida');
        res.redirect('/iniciar-sesion');
        return next();
    }

    if(req.file && grupo.imagen) {
        const imagenGuardada = `${__dirname}/../public/uploads/grupos/${grupo.imagen}`;
        fs.unlink(imagenGuardada, (error) => {
            if(error){
                console.log(error);
            }
        });
    }

    if(req.file) {
        grupo.imagen = req.file.filename;
    }

    await grupo.save();
    req.flash('exito', 'Cambios almacenados Correctamente');
    res.redirect('/administracion');
}

exports.formEliminarGrupo = async (req, res, next) => {
    const grupo = await Grupos.findOne({ where : {
        id: req.params.grupoId,
        usuarioId: req.user.id
    } });

    if(!grupo) {
        req.flash('error', 'Operación no Válida');
        res.redirect('/administracion');
        return next();
    }

    res.render('eliminar-grupo', {
        nombrePagina: `Eliminar Grupo: ${grupo.nombre}`
    });
}

exports.eliminarGrupo = async (req, res, next) => {
    const grupo = await Grupos.findOne({ where : {
        id: req.params.grupoId,
        usuarioId: req.user.id
    } });

    if(!grupo) {
        req.flash('error', 'Operación no Válida');
        res.redirect('/iniciar-sesion');
        return next();
    }

    if(grupo.imagen) {
        const imagenGuardada = `${__dirname}/../public/uploads/grupos/${grupo.imagen}`;
        fs.unlink(imagenGuardada, (error) => {
            if(error){
                console.log(error);
            }
            return;
        });
    }

    await Grupos.destroy({
        where: {
            id: req.params.grupoId
        }
    });

    req.flash('exito', 'Grupo Eliminado');
    res.redirect('/administracion');
}