/**
 * Función para inicializar plugins que la app deba usar.
 * @param plugins []
 */
function runPluginsSync(plugins) {
    if (plugins.length === 0) return;
    for(const plugin of plugins){
        plugin();
    }
}
async function runPlugins(plugins) {
    if (plugins.length === 0) return;
    for(const plugin of plugins){
        await plugin();
    }
}
module.exports = {
    runPlugins,
    runPluginsSync
};
