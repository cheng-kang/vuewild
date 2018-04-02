var path = require('path')
process.env.CHROME_BIN = require('puppeteer').executablePath()

module.exports = function (config) {
  config.set({
    frameworks: ['mocha', 'sinon-chai'],
    browsers: ['ChromeHeadless'],
    reporters: ['spec', 'coverage'],
    files: [
      'tests/vuewild.spec.js'
    ],
    preprocessors: {
      'tests/vuewild.spec.js': ['webpack', 'sourcemap']
    },
    logLevel: config.LOG_DEBUG,
    client: {
      captureConsole: true,
      mocha: {
        timeout: 10000
      }
    },
    webpack: {
      devtool: '#inline-source-map',
      module: {
        loaders: [{
          include: path.resolve(__dirname, 'src/vuewild.js'),
          loader: 'istanbul-instrumenter'
        }]
      }
    },
    webpackMiddleware: {
      noInfo: true
    },
    coverageReporter: {
      reporters: [
        { type: 'lcov', subdir: '.' },
        { type: 'text-summary' }
      ]
    }
  })
}
