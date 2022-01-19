const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");

module.exports = function override(config, env) {
    config.output.publicPath = "auto";

    if (!config.plugins) {
        config.plugins = [];
    }

    config.plugins.unshift(
        new ModuleFederationPlugin({
            name: "host",
            filename: "remoteEntry.js",
            remotes: {
                host: "host@/remoteEntry.js",
                module_a: "module_a@/container/module_a//remoteEntry.js",
            },
            exposes: {
                "./Register": "./src/Register",
            },
        })
    );

    return config;
};
