const webpack = require('webpack')
const eslintFormatter = require('eslint-friendly-formatter')

const path = require('path')

let mode = 'development'

module.exports = (env, argv = {}) => {
  if (argv.mode) {
    mode = argv.mode // eslint-disable-line prefer-destructuring
    console.log('\nBuilding for\x1b[34m', mode, '\x1b[0m\n') // eslint-disable-line no-console
  }

  return {
    mode,
    context: path.resolve(__dirname, 'src'),
    resolve: {
      extensions: ['*', '.js'],
      modules: ['node_modules', path.resolve(__dirname, 'src')],
    },
    entry: 'index.js',
    output: {
      library: '@reboil/domain-data',
      // libraryTarget: 'commonjs2',
      libraryTarget: 'system',
      auxiliaryComment: 'Test Comment',
      path: path.join(__dirname, 'lib'),
      filename: 'index.js',
    },
    externals: /node_modules/,
    devtool: mode === 'development' ? 'cheap-module-source-map' : false,
    watch: mode === 'development',
    module: {
      rules: [
        {
          test: /\.js$/,
          enforce: 'pre',
          exclude: /node_modules/,
          include: [path.resolve(__dirname, 'src')],
          use: [
            {
              loader: 'eslint-loader',
              options: {
                formatter: eslintFormatter,
              },
            },
          ],
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
        },
      ],
    },
    plugins: [
      new webpack.NamedModulesPlugin(),
      new webpack.NoEmitOnErrorsPlugin(),
      // new webpack.DefinePlugin({
      //   DEVELOPMENT: mode === 'development',
      //   // DEFAULT_CONFIG: JSON.stringify(mode === 'development' ? DEFAULT_CONFIG : {}),
      // }),
    ],
    // stats: {
    //   colors: true,
    //   children: false,
    //   chunks: false,
    //   chunkModules: false,
    //   modules: false,
    // },
    optimization: {
      minimize: mode === 'production', //false,
    },
    stats: {
      colors: true,
      errors: true,
      errorDetails: true,
      modules: true,
      warnings: true,
    },
  }
}
