const passport = require('passport');


exports.confirmarCuenta = passport.authenticate('local', {
    successRedirect: '/administracion',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Ambos campos son obligatorios'
})

//Revisa que el usuario este autenticado
exports.usuarioAutenticado = (req, res, next) => {
    //Si el usuario esta autenticado, adelante
    if(req.isAuthenticated()) {
        return next();
    }

    //Sino redireccionar

    return res.redirect('/iniciar-sesion');
}

exports.cerrarSesion = (req, res, next) => {
    req.logout();
    req.flash('exito', 'Cerraste Sesión Correctamente');
    res.redirect('/iniciar-sesion');
    next();
}