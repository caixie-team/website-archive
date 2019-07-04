// postcss.config.js
module.exports = {
  plugins: {
    'postcss-preset-env': {
      // importFrom: 'src/styles/variables.module.css',
      importFrom: 'src/styles/global.css',
      features: {
        'custom-properties': true, // already enabled by default
        'custom-media-queries': true,
        'custom-selectors': true,
      },
    },
  },
}
