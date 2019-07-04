import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {graphql} from 'gatsby';

import Layout from 'components/Layout';
import Link from 'components/Link';
import Insight from 'components/Insight';
// import SEO from 'components/SEO';
import Section from 'components/Section';
import Arrow from 'components/Arrow';
import AnimatedArrow from 'components/AnimatedArrow';

import {lteSmallViewport} from 'lib/media-query';

import styles from './styles.module.css';

class Insights extends Component {
  static propTypes = {
    data: PropTypes.object.isRequired,
    transitionStatus: PropTypes.string.isRequired,
    pageContext: PropTypes.shape({
      previousPagePath: PropTypes.string,
      nextPagePath: PropTypes.string,
      numberOfPages: PropTypes.number,
      humanPageNumber: PropTypes.number,
      limit: PropTypes.number,
    }).isRequired,
  }

  state = {
    internet: null,
  };

  onInternetEnter = name => () => {
    this.setState({internet: name});
  }

  onInternetLeave = () => {
    this.setState({internet: null});
  }

  render() {
    const {
      data,
      transitionStatus,
      pageContext: {
        previousPagePath, nextPagePath, humanPageNumber, numberOfPages,
      },
    } = this.props;
    const {internet} = this.state;

    return (
      <Layout transitionStatus={transitionStatus}>
        {/*<SEO title="Insights from the team" />*/}

        <div className={styles.hero}>
          <h1>我们的洞见</h1>
        </div>

        <Section
          className={styles.page}
          // eslint-disable-next-line no-irregular-whitespace
          title={`${humanPageNumber} of ${numberOfPages} pages`}
        >
          <ul>
            {data.insights.edges.map(({node: insight}, idx) => (
              <li className={styles.insight} key={`insight-${idx}`}>
                <Insight
                  slug={insight.fields.slug}
                  excerpt={insight.excerpt}
                  {...insight.frontmatter}
                />
              </li>
            ))}
          </ul>
          <div className={styles.pagination}>
            {previousPagePath ? (
              <Link to={previousPagePath} className={styles.prev}>
                <Arrow direction="left" color="white" size="1.75rem" />
                Newer
              </Link>
            ) : <span />}
            {nextPagePath && (
              <Link to={nextPagePath} className={styles.next}>
                Older
                <Arrow direction="right" color="white" size="1.75rem" />
              </Link>
            )}
          </div>
        </Section>

        <Section className={styles.internet} title="Internet">
          <ul>
            <li className={styles.internetLink}>
              <a
                href="https://twitter.com/plntary"
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={this.onInternetEnter('twitter')}
                onMouseLeave={this.onInternetLeave}
              >
                <h2>Twitter</h2>
                <AnimatedArrow
                  className={styles.arrow}
                  color="#578ef1"
                  size={lteSmallViewport() ? 40 : 81}
                  state={
                    internet === 'twitter'
                      ? AnimatedArrow.PLUS
                      : AnimatedArrow.ARROW
                  }
                />
              </a>
            </li>
            <li className={styles.internetLink}>
              <a
                href="https://instagram.com/planetarycorp"
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={this.onInternetEnter('instagram')}
                onMouseLeave={this.onInternetLeave}
              >
                <h2>Instagram</h2>
                <AnimatedArrow
                  className={styles.arrow}
                  color="#cd4b3a"
                  size={lteSmallViewport() ? 40 : 81}
                  state={
                    internet === 'instagram'
                      ? AnimatedArrow.PLUS
                      : AnimatedArrow.ARROW
                  }
                />
              </a>
            </li>
          </ul>
        </Section>
      </Layout>
    );
  }
}

export default Insights;

export const InsightsQuery = graphql`
    query Insights($skip: Int!, $limit: Int!) {
        insights: allMarkdownRemark(
            sort: { order: DESC, fields: [frontmatter___date] },
            limit: $limit,
            skip: $skip,
            filter: { frontmatter: { templateKey: { eq: "insight" } }}
        ) {
            edges {
                node {
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
                        primaryColor
                    }
                }
            }
        }
    }
`;
