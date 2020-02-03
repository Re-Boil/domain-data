// const fs = require('fs')
// const path = require('path')

// const APP_PATH = fs.realpathSync(process.cwd())
// const resolve = relativePath => path.resolve(APP_PATH, relativePath)

module.exports = api => {
  api.cache(() => process.env.NODE_ENV)

  return {
    plugins: [
      '@babel/plugin-proposal-optional-chaining',
      '@babel/plugin-proposal-nullish-coalescing-operator',
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-syntax-object-rest-spread',
      '@babel/plugin-syntax-dynamic-import',
    ],
    presets: [
      [
        '@babel/preset-env',
        {
          targets: {
            browsers: ['last 2 versions'],
          },
          modules: false, // 'auto',
          debug: false,
          // useBuiltIns: 'usage',
        },
      ],
      '@babel/preset-flow',
    ],
  }
}
