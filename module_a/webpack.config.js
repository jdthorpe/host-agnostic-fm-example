const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");

const deps = require("./package.json").dependencies;

module.exports = {
    mode: "development",
    devtool: false,
    plugins: [
        new ModuleFederationPlugin({
            name: "module_a",
            filename: "remoteEntry.js",
            remotes: {
                host: "host@/remoteEntry.js",
            },
            exposes: {
                "./Work": "./src/index",
            },
        }),
    ],
};
