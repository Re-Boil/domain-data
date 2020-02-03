const webpack = require('webpack')
const eslintFormatter = require('eslint-friendly-formatter')

const path = require('path')

let mode = 'development'

module.exports = (env, argv = {}) => {
  if (argv.mode) {
    mode = argv.mode // eslint-disable-line prefer-destructuring
    console.log('\nBuilding for\x1b[34m', mode, '\x1b[0m\n') // eslint-disable-line no-console
  }

  const common = {
    mode,
    context: path.resolve(__dirname, 'src'),
    resolve: {
      extensions: ['*', '.js'],
      modules: ['node_modules', path.resolve(__dirname, 'src')],
    },
    externals: /node_modules/,
    devtool: mode === 'development' ? 'cheap-module-source-map' : false,
    // devtool: '#cheap-module-eval-source-map',
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
          use: [
            {
              loader: 'babel-loader',
              // options: {
              //   rootMode: 'upward',
              // },
            },
          ],
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
    optimization: {
      // minimize: false,
      minimize: mode === 'production',
    },
    stats: {
      colors: true,
      errors: true,
      errorDetails: true,
      modules: true,
      warnings: true,
    },
  }

  return [
    {
      ...common,
      entry: 'index.js',
      output: {
        library: '@reboil/domain-data',
        libraryTarget: 'commonjs2',
        // libraryTarget: 'system',
        auxiliaryComment: 'Test Comment',
        path: path.join(__dirname, 'lib'),
        filename: 'index.js',
      },
    },
    {
      ...common,
      entry: 'extenders/index.js',
      output: {
        library: '@reboil/domain-data/extenders',
        libraryTarget: 'commonjs2',
        // libraryTarget: 'system',
        auxiliaryComment: 'Test Comment',
        path: path.join(__dirname, 'lib/extenders'),
        filename: 'index.js',
      },
    },
    {
      ...common,
      entry: 'utils/index.js',
      output: {
        library: '@reboil/domain-data/utils',
        libraryTarget: 'commonjs2',
        // libraryTarget: 'system',
        auxiliaryComment: 'Test Comment',
        path: path.join(__dirname, 'lib/utils'),
        filename: 'index.js',
      },
    },
  ]
}
