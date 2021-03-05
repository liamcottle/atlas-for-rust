module.exports = {
    pluginOptions: {
        electronBuilder: {
            preload: 'src/preload.js',
            builderOptions: {
                appId: 'com.liamcottle.electron.rustplus',
            },
            externals: [
                'push-receiver',
            ],
        },
    },
}