import React, { Fragment } from "react"
import PropTypes from "prop-types"
import { graphql } from "gatsby"
import BackgroundImage from "gatsby-background-image"
import classnames from "classnames"

import Layout from "components/Layout"
// import SEO from "components/SEO"
import Insight from "components/Insight"

import styles from "./styles.module.css"

export const InsightTemplate = ({
                                  title, author, date, hero, content,
                                }) => (
  <Fragment>
    <header className={styles.header}>
      <h1>{title}</h1>
      <div className={styles.attribution}>
        <span className={styles.author}>By {author}, </span>
        <span className={styles.date}>{date}</span>
      </div>
    </header>
    {hero && (
      <BackgroundImage
        className={classnames(styles.hero, "fullWidth")}
        fluid={hero.childImageSharp.fluid}
      />
    )}
    <div className={styles.content} dangerouslySetInnerHTML={{ __html: content }}/>
  </Fragment>
)

InsightTemplate.defaultProps = {
  content: "",
}

InsightTemplate.propTypes = {
  title: PropTypes.string.isRequired,
  author: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  hero: PropTypes.object.isRequired,
  content: PropTypes.string,
}

const InsightPage = ({
                       data: { insight, next, prev },
                       transitionStatus,
                     }) => (
  <Layout transitionStatus={transitionStatus}>
{/*    <SEO
      article
      title={insight.frontmatter.title}
      description={insight.excerpt}
      ogImage={
        insight.frontmatter.thumb
          ? insight.frontmatter.thumb.childImageSharp.fluid.src
          : (
            insight.frontmatter.hero
            && insight.frontmatter.hero.childImageSharp.fluid.src
          )
      }
    />*/}
    <InsightTemplate
      {...insight.frontmatter}
      content={insight.html}
    />
    <ul className={styles.more}>
      <li className={styles.insight}>
        <Insight
          slug={prev.fields.slug}
          excerpt={prev.excerpt}
          {...prev.frontmatter}
        />
      </li>
      <li className={styles.insight}>
        <Insight
          slug={next.fields.slug}
          excerpt={prev.excerpt}
          {...next.frontmatter}
        />
      </li>
    </ul>
  </Layout>
)

InsightPage.propTypes = {
  data: PropTypes.object.isRequired,
  transitionStatus: PropTypes.string.isRequired,
}

export default InsightPage

export const InsightQuery = graphql`
    query Insight($id: String!, $prev: String!, $next: String!) {
        insight: markdownRemark(id: { eq: $id }) {
            html
            excerpt
            frontmatter {
                title
                author
                date
                featured {
                    childImageSharp {
                        fluid(quality: 60, maxWidth: 2880) {
                            ...GatsbyImageSharpFluid_withWebp
                        }
                    }
                }
                thumb {
                    childImageSharp {
                        fluid(quality: 60, maxWidth: 1280) {
                            ...GatsbyImageSharpFluid_withWebp
                        }
                    }
                }
            }
        }
        next: markdownRemark(id: { eq: $next }) {
            excerpt
            fields {
                slug
            }
            frontmatter {
                title
                author
                date
                featured {
                    childImageSharp {
                        fluid(quality: 60, maxWidth: 1280) {
                            ...GatsbyImageSharpFluid_withWebp
                        }
                    }
                }
                thumb {
                    childImageSharp {
                        fluid(quality: 60, maxWidth: 1280) {
                            ...GatsbyImageSharpFluid_withWebp
                        }
                    }
                }
            }
        }
        prev: markdownRemark(id: { eq: $prev }) {
            excerpt
            fields {
                slug
            }
            frontmatter {
                title
                author
                date
                primaryColor
                featured {
                    childImageSharp {
                        fluid(quality: 60, maxWidth: 1280) {
                            ...GatsbyImageSharpFluid_withWebp
                        }
                    }
                }
                thumb {
                    childImageSharp {
                        fluid(quality: 60, maxWidth: 1280) {
                            ...GatsbyImageSharpFluid_withWebp
                        }
                    }
                }
            }
        }
    }
`
