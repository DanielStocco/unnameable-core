/**
 * Función para inicializar plugins que la app deba usar.
 * @param plugins []
 */
function runPlugins(plugins) {

    if (plugins.length === 0) { return }

    for(const plugin of plugins){
        plugin();
    }

}


module.exports = {
    runPlugins
};
