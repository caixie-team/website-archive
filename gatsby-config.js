/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.org/docs/gatsby-config/
 */

module.exports = {
  /* Your site config here */
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/src/data/project`,
        name: "project",
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: "gatsby-plugin-svgr",
      options: {
        prettier: true,         // use prettier to format JS code output (default)
        svgo: true,             // use svgo to optimize SVGs (default)
        svgoConfig: {
          removeViewBox: true, // remove viewBox when possible (default)
          cleanupIDs: true,    // remove unused IDs and minify remaining IDs (default)
        },
      },
    },
    `gatsby-plugin-transition-link`,
    "gatsby-plugin-postcss",
    "gatsby-plugin-css-customs",
    // {
    //   resolve: `gatsby-plugin-postcss`,
    //   options: {
    //     postCssPlugins: [require(`postcss-preset-env`)({
    //       importFrom: 'src/styles/variables.module.css',
    //       features: {
    //         'custom-properties': true, // already enabled by default
    //         'custom-media-queries': true,
    //         'custom-selectors': true,
    //       },
    //     })],
    //   },
    // },
    {
      // resolve: `gatsby-transformer-remark`,
      resolve: require.resolve(`./plugins/gatsby-transformer-remark`),
      options: {
        // CommonMark mode (default: true)
        commonmark: true,
        // Footnotes mode (default: true)
        footnotes: true,
        // Pedantic mode (default: true)
        pedantic: true,
        // GitHub Flavored Markdown mode (default: true)
        gfm: true,
        sections: true,
        // Plugins configs
        plugins: [
          {
            resolve: require.resolve(`./plugins/gatsby-remark-sections`)
          },
          {
            resolve: `gatsby-remark-images`,
            options: {
              // It's important to specify the maxWidth (in pixels) of
              // the content container as this plugin uses this as the
              // base for generating different widths of each image.
              maxWidth: 590,
            },
          },
          {
            resolve: "gatsby-remark-images-grid",
            options: {
              className: "myCustomClassName",
              gridGap: "20px",
              margin: "20px auto",
            },
          },
        ],
      },
    },
    `gatsby-transformer-yaml`,
  ],
}
