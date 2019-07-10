const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLJSON,
} = require(`gatsby/graphql`)
const Remark = require(`remark`)
const _ = require(`lodash`)

module.exports = (
  {
    type,
    pathPrefix,
    getNode,
    getNodesByType,
    cache,
    reporter,
    ...rest
  },
  pluginOptions,
) => {
  if (type.name !== `MarkdownRemark`) {
    console.log("--------")
    console.log("--------")
    console.log("--------")
    console.log("--------")
    console.log("--------")
    console.log("--------")
    console.log("No markdownRemark")
    return {}
  }

  console.log("======")
  console.log("======")
  console.log("======")
  console.log("======")
  console.log("有内容。。。。")
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
      html: {
        type: GraphQLString,
        resolve(markdownNode) {
          return ""
        },
      },
      htmlAst: {
        type: GraphQLJSON,
        resolve(markdownNode) {
          return {}
        },
      },
      excerpt: {
        type: GraphQLString,
        resolve(markdownNode) {
          return ""
        },
      },
      excerptAst: {
        type: GraphQLString,
        resolve(markdownNode) {
          return ""
        },
      },
      sections: {
        type: new GraphQLList(GraphQLJSON),
        resolve(markdownNode) {
          console.log("get secitons...")
          console.log(markdownNode.sections)
          return []
        },
      },

    })
  })

}
