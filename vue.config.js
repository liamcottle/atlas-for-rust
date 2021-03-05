module.exports = {
    pluginOptions: {
        electronBuilder: {
            preload: 'src/preload.js',
            builderOptions: {
                productName: "Atlas for Rust",
                appId: 'com.liamcottle.electron.atlas-for-rust',
                artifactName: 'AtlasForRust-${version}-${os}-${arch}.${ext}'
            },
            externals: [
                'push-receiver',
            ],
        },
    },
}