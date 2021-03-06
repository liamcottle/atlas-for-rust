module.exports = {
    pluginOptions: {
        electronBuilder: {
            preload: 'src/preload.js',
            builderOptions: {
                productName: "Atlas for Rust",
                appId: 'com.liamcottle.electron.atlas-for-rust',
                artifactName: 'AtlasForRust-${version}-${os}-${arch}.${ext}',
                "mac": {
                    "icon": "./public/icon_rounded.png",
                },
                "win": {
                    "icon": "./public/icon_rounded.png",
                },
            },
            externals: [
                'push-receiver',
            ],
        },
    },
}