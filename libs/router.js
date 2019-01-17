const express = require('express');
const router = express.Router();

const { ApiError } = require('../errors/types');

/**
 * Función para inicializar las rutas de la aplicación
 * @param app
 * @param routes [{uri: String, controller: function}]
 */
function setupRoutes(app, routes) {

    for(const route of routes){
        app.use(route.uri, route.controller);
    }

    // catch 404 and forward to the error handler
    app.use((req, res, next) => next(new ApiError('ROUTE_NOT_FOUND')));
}


module.exports = {
    router,
    setupRoutes
};
