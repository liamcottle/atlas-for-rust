module.exports = {
    // use dist folder in production
    publicPath: process.env.NODE_ENV === 'production' ? `${process.cwd()}/dist/` : '',
}