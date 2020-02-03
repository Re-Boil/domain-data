var path = require('path');

module.exports = {
  'parser': 'babel-eslint',
  'parserOptions': {
    'sourceType': 'module',
    'allowImportExportEverywhere': false
  },
  'extends': [
    'eslint:recommended',
    'plugin:prettier/recommended',
    'prettier',
    // 'prettier/flowtype',
    'plugin:flowtype/recommended',
    'plugin:import/errors',
    'plugin:flowtype-errors/recommended',
    // 'prettier/flowtype'
  ],
  'plugins': [
    'import',
    'prettier',
    'flowtype'
    // 'flowtype-errors'
  ],
  'env': {
    'browser': true,
    'es6': true,
    'node': true,
    'mocha': true,
    'jest': true,
  },
  'settings': {
    'import/resolver': {
      'webpack': {
        'config': path.resolve('./webpack.config.js')
      }
    },
    // 'flowtype': {
    // 'onlyFilesWithFlowAnnotation': true
    // }
  },
  'rules': {
    'prettier/prettier': 'error',
    // 'flowtype-errors/show-errors': 'error'
    'no-plusplus': 'off',
    'no-unused-vars': ['error', { 'ignoreRestSiblings': true }],
    'arrow-parens': ['error', 'as-needed'],
    'complexity': ['error', 10],
    'max-len': [
      'error',
      {
        'code': 120,
        'comments': 0,
        'ignoreComments': true,
        'ignoreTemplateLiterals': true
      }
    ],
    'newline-after-var': ['error', 'always'],
    'no-console': [
      'warn',
      {
        allow: ['info', 'warn', 'error']
      }
    ],
    'no-shadow': ['error', { builtinGlobals: true, hoist: 'all' }],
    'padding-line-between-statements': [
      'error',
      { blankLine: 'always', prev: 'export', next: '*' },
      { blankLine: 'any', prev: 'export', next: 'export' }
    ],
    'semi': [ 'error', 'never' ],
  }
}
