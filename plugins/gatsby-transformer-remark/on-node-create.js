const grayMatter = require(`gray-matter`)
const _ = require(`lodash`)
const yaml = require("js-yaml")

module.exports = async function onCreateNode(
  {
    node,
    loadNodeContent,
    actions,
    createNodeId,
    reporter,
    createContentDigest,
  },
  pluginOptions,
) {
  const { createNode, createParentChildLink } = actions
  // console.log(node.internal)
  // console.log("create node ........")
  // We only care about markdown content.
  if (
    node.internal.mediaType !== `text/markdown` &&
    node.internal.mediaType !== `text/x-markdown`
  ) {
    return {}
  }

  const content = await loadNodeContent(node)
  try {
    let data = grayMatter(content, pluginOptions)

    // console.log("on node create ....")
    // console.log(data)
    // console.log("on node create end ...")
    // console.log(data.data)
    if (data.data) {
      data.data = _.mapValues(data.data, value => {
        if (_.isDate(value)) {
          return value.toJSON()
        }
        return value
      })
    }
    // console.log(data.data)

    let markdownNode = {
      id: createNodeId(`${node.id} >>> MarkdownRemark`),
      children: [],
      parent: node.id,
      internal: {
        content: data.content,
        type: `MarkdownRemark`,
      },
    }

    // const createMarkdownNode = data => {
    //   let markdownNode = {
    //     id: createNodeId(
    //       `${data.key ? node.id + data.key : node.id} >>> MarkdownRemark`
    //     ),
    //     children: [],
    //     parent: node.id,
    //     internal: {
    //       content: data.content,
    //       type: `MarkdownRemark`,
    //     },
    //   }
    // }

    // const markdownNode = createMarkdownNode(data)
    // console.log()



    // console.log('data....')
    // console.log(dataSections)
    // let dataSections = []
    if (data.sections && Object.keys(data.sections).length) {
      data.sections.map(section => {
        if (section.data) {
          section.data = yaml.safeLoad(section.data)
        }
        return section
      })
      // for (let section of data.sections) {
      //   section = JSON.stringify(section)
      //   dataSections.push(JSON.stringify(section))
      // }
    }

    markdownNode.frontmatter = {
      title: ``, // always include a title
      ...data.data,
    }
    markdownNode.sections = data.sections
    markdownNode.excerpt = data.excerpt
    markdownNode.rawMarkdownBody = data.content

    // Add path to the markdown file path
    if (node.internal.type === `File`) {
      markdownNode.fileAbsolutePath = node.absolutePath
    }

    markdownNode.internal.contentDigest = createContentDigest(markdownNode)

    createNode(markdownNode)
    createParentChildLink({ parent: node, child: markdownNode })

    return markdownNode
  } catch (err) {
    reporter.panicOnBuild(
      `Error processing Markdown ${
        node.absolutePath ? `file ${node.absolutePath}` : `in node ${node.id}`
        }:\n
      ${err.message}`,
    )

    return {} // eslint
  }
}
