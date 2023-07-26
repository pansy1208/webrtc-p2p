const {resolve} = require("path")
module.exports = {
    typescript: {
        enableTypeChecking: true
    },
    webpack: {
        alias: {
            "@": resolve(__dirname,"src")
        }
    }
}