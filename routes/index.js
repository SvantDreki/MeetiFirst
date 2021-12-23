const express = require('express');
const router = express.Router();

const homeController = require('../controllers/homeController');
const usuariosController = require('../controllers/usuariosController');
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const gruposController = require('../controllers/gruposController');
const meetiController = require('../controllers/meetiController');

const meetiControllerFE = require('../controllers/frontEnd/meetiControllerFE');
const usuariosControllerFE = require('../controllers/frontEnd/usuariosControllerFE');
const gruposControllerFE = require('../controllers/frontEnd/gruposControllerFE');
const comentariosControllerFE = require('../controllers/frontEnd/comentariosControllerFE');
const busquedaControllerFE = require('../controllers/frontEnd/busquedaControllerFE');

module.exports = function() {

    /* AREA PUBLICA */
    
    router.get('/', homeController.home); //

    //Muestra un meeti
    router.get('/meeti/:slug', meetiControllerFE.mostrarMeeti); //

    //Confirma la asistencia a un meeti
    router.post('/confirmar-asistencia/:slug', meetiControllerFE.confirmarAsistencia); //

    //Muestra los asistentes al meeti
    router.get('/asistentes/:slug', meetiControllerFE.mostrarAsistentes); //

    //Agrega comentarios en el meeti
    router.post('/meeti/:id', comentariosControllerFE.agregarComentario); //

    //Elimina comentario en el meeti
    router.post('/eliminar-comentario', comentariosControllerFE.eliminarComentario); //

    //Muestra perfiles en el frontend
    router.get('/usuarios/:id', usuariosControllerFE.mostrarUsuario); //

    //Muestra los grupos en el frontEnd
    router.get('/grupos/:id', gruposControllerFE.mostrarGrupo); //

    //Muestra meeti´s por categoria
    router.get('/categoria/:slug', meetiControllerFE.mostrarCategoria); //

    //Añade a la Busqueda
    router.get('/busqueda', busquedaControllerFE.resultadosBusqueda);

    //Crear Cuenta
    router.get('/crear-cuenta', usuariosController.formCrearCuenta); //
    router.post('/crear-cuenta', usuariosController.crearNuevoCuenta); //

    //Iniciar Sesion
    router.get('/iniciar-sesion', usuariosController.formIniciarSesion); //
    router.post('/iniciar-sesion', authController.confirmarCuenta); //

    //Cerrar Sesion
    router.get('/cerrar-sesion', authController.usuarioAutenticado, authController.cerrarSesion); //

    /* AREA PRIVADA */

    //Panel de administracion
    router.get('/administracion', authController.usuarioAutenticado, adminController.panelAdministracion); //

    //Nuevos Grupos
    router.get('/nuevo-grupo', authController.usuarioAutenticado, gruposController.formNuevoGrupo);
    router.post('/nuevo-grupo', authController.usuarioAutenticado, gruposController.subirImagen, gruposController.crearGrupo );

    //Editar Grupos
    router.get('/editar-grupo/:grupoId', authController.usuarioAutenticado, gruposController.formEditarGrupo);
    router.post('/editar-grupo/:grupoId', authController.usuarioAutenticado, gruposController.editarGrupo);

    //Editar imagen
    router.get('/imagen-grupo/:grupoId', authController.usuarioAutenticado, gruposController.formEditarImagen);
    router.post('/imagen-grupo/:grupoId', authController.usuarioAutenticado, gruposController.subirImagen, gruposController.editarImagen);

    //Eliminar Grupo
    router.get('/eliminar-grupo/:grupoId', authController.usuarioAutenticado, gruposController.formEliminarGrupo);
    router.post('/eliminar-grupo/:grupoId', authController.usuarioAutenticado, gruposController.eliminarGrupo);

    //Nuevos Meetis
    router.get('/nuevo-meeti', authController.usuarioAutenticado, meetiController.formNuevoMeeti);
    router.post('/nuevo-meeti', authController.usuarioAutenticado, meetiController.sanitizarMeeti, meetiController.crearMeeti);

    //Editar meetis
    router.get('/editar-meeti/:id', authController.usuarioAutenticado, meetiController.formEditarMeeti);
    router.post('/editar-meeti/:id', authController.usuarioAutenticado, meetiController.editarMeeti);

    //Eliminar meetis
    router.get('/eliminar-meeti/:id', authController.usuarioAutenticado, meetiController.formEliminarMeeti);
    router.post('/eliminar-meeti/:id', authController.usuarioAutenticado, meetiController.eliminarMeeti);

    //Editar perfiles
    router.get('/editar-perfil', authController.usuarioAutenticado, usuariosController.formEditarPerfil);
    router.post('/editar-perfil', authController.usuarioAutenticado, usuariosController.editarPerfil);

    router.get('/cambiar-password', authController.usuarioAutenticado, usuariosController.formCambiarPassword);
    router.post('/cambiar-password', authController.usuarioAutenticado, usuariosController.cambiarPassword);

    router.get('/imagen-perfil', authController.usuarioAutenticado, usuariosController.formImagenPerfil);
    router.post('/imagen-perfil', authController.usuarioAutenticado, usuariosController.subirImagen, usuariosController.imagenPerfil);

    return router;
}