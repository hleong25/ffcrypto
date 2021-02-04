module.exports = {
    presets: [
        [
            "@babel/preset-env",
            {
                "targets": {
                    "node": "current"
                }
            }
        ],
        "@babel/preset-typescript"
        // "@babel/react"
    ],
    plugins: [
        [
            "@babel/plugin-proposal-decorators",
            {
                "legacy": true
            }
        ],
        "@babel/plugin-proposal-class-properties",
        "babel-plugin-parameter-decorator"
    ]
}