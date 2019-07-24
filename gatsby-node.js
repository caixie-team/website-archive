const path = require(`path`)
const get = require("lodash/get")
const kebabCase = require("lodash/kebabCase")
const uniq = require("lodash/uniq")
const matter = require("gray-matter")
const yaml = require("js-yaml")
const { createFilePath } = require(`gatsby-source-filesystem`)
// const str = require('./src/data/projects/amazon.md')
const fs = require("fs")
const { base64, fluid, fixed } = require("gatsby-plugin-sharp")
// const fs = require("fs")
// const str = fs.readFileSync(path.join(__dirname, "src/data/project", "amazon.md"))
// const res = matter(str, { excerpt: true, sections: true });
// console.log(JSON.stringify(res, null, 2));
// console.log(res.sections)
// for (let section of res.sections) {
//   if (typeof section.data === 'string' && section.data.trim() !== '') {
//     section.data = yaml.safeLoad(section.data)
//   }
//   section.content = section.content.trim() + "\n"
// }
// console.log(res.sections)
// console.log('show sections ...')
// console.log(res.sections)
// console.log(JSON.stringify(res, null, 2))
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLJSON,
} = require(`gatsby/graphql`)
const Remark = require(`remark`)
const _ = require(`lodash`)


exports.onCreateNode = async ({ node, getNode, actions, loadNodeContent, createContentDigest }) => {
  function getFileObject(absolutePath, name) {
    return {
      id: `${absolutePath} absPath of file`,
      name: name,
      absolutePath,
      extension: `png`,
      width: 1440,
      internal: {
        contentDigest: createContentDigest(node),
      },
    }
  }

  const { createNodeField } = actions
  if (node.internal.type === `MarkdownRemark` || node.internal.type === `Mdx`) {
    // const content = await loadNodeContent(node)

    const slug = createFilePath({ node, getNode })
    const templateKey = node.frontmatter.templateKey
    node.sections = []
    if (node.frontmatter.sections) {
      for (let section of node.frontmatter.sections) {
        if (section.type === "image") {
          const absolutePath = path.join(__dirname, "src/data/project/" + section.image)
          const file = getFileObject(absolutePath, section.image.split("/").pop().split(".")[0])
          const args = {
            maxWidth: 375,
          }
          const result = await fluid({ file, args })
          section.image = result
        }
        if (section.type === "imagegrid") {
          let images = []
          for (let image of section.images) {
            const absolutePath = path.join(__dirname, "src/data/project/" + image)
            const file = getFileObject(absolutePath, image.split("/").pop().split(".")[0])
            const args = {
              maxWidth: 1440,
            }
            const result = await fluid({
              file,
              args,
            })
            // section.images.push(result)
            images.push(result)
            //   image = result
          }
          section.images = images
        }
        // console.log('... section ...')
        // console.log(section)
        // console.log('... section ...')
        node.sections.push(section)
      }
    }
    delete node.frontmatter.sections
    // console.log("on create node ....")
    // console.log(node)
    // console.log(content)
    // console.log("on create node .... END")
    // node.sections = [{
    //   body: '<p>News</p>',
    //   header: 'Introduction',
    //   type: 'text'
    // }]
    // let dataSections = []
    // if (data.sections && Object.keys(data.sections).length) {
    //   data.sections.map(section => {
    //     if (section.data) {
    //       section.data = yaml.safeLoad(section.data)
    //     }
    //     return section
    //   })
    //   for (let section of data.sections) {
    // section = JSON.stringify(section)
    // dataSections.push(JSON.stringify(section))
    // }
    //
    // }
    //
    // node.sections = dataSections
    createNodeField({
      node,
      name: `slug`,
      value: templateKey === "project" || templateKey === "insight" ? templateKey + slug : slug,
    })

    createNodeField({
      node,
      name: "isPublic",
      value: "isPublic" in node.frontmatter ? node.frontmatter.isPublic : true,
    })

  }
}
exports.setFieldsOnGraphQLNodeType = async ({
                                              type,
                                              pathPrefix,
                                              getNode,
                                              getNodesByType,
                                              cache,
                                              reporter,
                                              ...rest
                                            },
                                            pluginOptions) => {
  if (type.name !== `MarkdownRemark`) {
    return {}
  }

  return new Promise((resolve, reject) => {
    // Setup Remark.
    const {
      blocks,
      commonmark = true,
      footnotes = true,
      gfm = true,
      pedantic = true,
    } = pluginOptions

    const remarkOptions = {
      commonmark,
      footnotes,
      gfm,
      pedantic,
    }
    if (_.isArray(blocks)) {
      remarkOptions.blocks = blocks
    }
    let remark = new Remark().data(`settings`, remarkOptions)

    return resolve({
      sections: {
        type: new GraphQLList(GraphQLJSON),
        resolve(markdownNode) {
          console.log("get secitons...")
          // console.log(markdownNode.sections)
          // return []
          // console.log(markdownNode.sections)
          // if (markdownNode.sections) {
          //   for (let section of markdownNode.sections) {
          //     if (section.image) {
          //       const absolutePath = path.join(__dirname, "src/data/project/" + section.image)
          //       const file = getFileObject(absolutePath)
          //       const result = fluid({ file })
          //       section.image = result
          //     }
          //   }
          // }
          return markdownNode.sections
        },
      },
    })
  })

}
const getTags = posts => {
  const tags = posts.reduce((ac, edge) => {
    return get(edge, "node.frontmatter.tags")
      ? ac.concat(edge.node.frontmatter.tags)
      : ac
  }, [])

  return uniq(tags)
}


exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions
  return graphql(`
  {
        allMarkdownRemark{
            edges {
                node {
                    html
                    excerpt
                    id
                    fields {
                        slug
                    }
                    frontmatter {
                        templateKey
                        title
                        subtitle
                        summary
                        primaryColor
                        hero {
                            publicURL
                        }
                    }
                }
            }
        }
    }
  `).then(result => {
    const { edges } = result.data.allMarkdownRemark
    // 创建文章列表页
    createPage({
      path: "/insights",
      component: path.resolve(`src/templates/insights/index.js`),
      context: {
        skip: 0,
        limit: 12,
      },
    })
    edges.forEach(({ node, index, array }) => {
      if (node.frontmatter.templateKey === "project") {
        console.log(node.id + node.fields.slug)
        createPage({
          path: node.fields.slug,
          component: path.resolve(`src/templates/project/index.js`),
          context: {
            id: node.id,
            next: node.id,
            // next: (index + 1) - 1 > 0 ? array[index + 1].fields.slug : index
          },
        })
      }

/*      if (node.frontmatter.templateKey === "insight") {
        createPage({
          path: node.fields.slug,
          component: path.resolve(`src/templates/insight/index.js`),
          context: {
            // $id: String!, $prev: String!, $next: String!
            id: node.id,
            prev: node.id,
            next: node.id,
          },
        })
      }*/
    })
  })
}

exports.onCreateWebpackConfig = ({ actions }) => {
  actions.setWebpackConfig({
    resolve: {
      modules: [path.resolve(__dirname, "src"), "node_modules"],
      alias: { $components: path.resolve(__dirname, "src/components") },
    },
  })
}
