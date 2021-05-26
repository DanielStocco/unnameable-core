const express = require('express');
const router = express.Router();

const { ApiError } = require('../errors/types');

/**
 * Función para inicializar las rutas de la aplicación
 * @param app
 * @param routes [{uri: String, controller: function}]
 */
function setupRoutes(app, routes) {
    for(const [moduleName, module] of Object.entries(routes)){
        module.map(route => {
            const path = `/${moduleName.toLowerCase()}${route.uri}`
            if (route.get) app.get(path, route.get);
            if (route.create) app.post(path, route.create);
            if (route.update) app.put(path, route.update);
            if (route.remove) app.delete(path, route.remove);
        })
    }
    // catch 404 and forward to the error handler
    app.use((req, res, next) => next(new ApiError('ROUTE_NOT_FOUND')));
}

module.exports = {
    router,
    setupRoutes
};
