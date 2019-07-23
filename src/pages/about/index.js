import React from 'react';
import PropTypes from 'prop-types';
import {graphql} from 'gatsby';

import Layout from 'components/Layout';
import Link from 'components/Link';
import Section from 'components/Section';
// import SEO from 'components/SEO';
// import Brush from 'components/Brush';
import Arrow from 'components/Arrow';

import {ReactComponent as Map} from '../../../static/assets/world_map.svg';

import styles from './styles.module.css';

const About = ({data: {page}, transitionStatus}) => {
  const {frontmatter} = page.edges[0].node;

  return (
    <Layout transitionStatus={transitionStatus}>
      {/*<SEO title="About" />*/}

      <h1 className={styles.heroText}>
        我们提供最优质的技术服务
        {/*We build*/}
        {/*<Brush number={3}>custom</Brush> */}
        {/*digital products for companies like*/}
        {/*Google, Amazon, and Univision.*/}
      </h1>

      <section
        className={styles.content}
        dangerouslySetInnerHTML={{__html: frontmatter.ledeHtml}}
      />

      <Section title="数据" className={styles.stats}>
        <div className={styles.statsDetail}>
          <h2>
            做最好的技术服务
          </h2>
          <div dangerouslySetInnerHTML={{__html: frontmatter.statsLedeHtml}} />
        </div>
        <ul className={styles.statList}>
          {frontmatter.stats.map((stat, idx) => (
            <li
              key={`stat${idx}`}
              className={
                frontmatter.stats.length % 2 === 1
                && idx === frontmatter.stats.length - 2
                  ? styles.oddPush
                  : null
              }
            >
              <h3>{
                stat.number.toString().length < 2
                  ? `0${stat.number}`
                  : stat.number
              }
              </h3>
              <p>
                <em>{stat.metric}</em> — {stat.description}
              </p>
            </li>
          ))}
        </ul>

        <Map className={styles.map} title="World map of the Planetary team" />
      </Section>

      <Section title="客户" className={styles.clients}>
        <ul>
          {frontmatter.clients.map((client, idx) => (
            <li key={`client${idx}`}>{client}</li>
          ))}
        </ul>

        <Link to="/" className={styles.largeNextLink}>
          <span className={styles.largeNextText}>展示我们的工作</span>
          <Arrow size="1.25rem" color="red" />
        </Link>
      </Section>

      <Section title="联络" className={styles.contact} contentClassName={styles.contactBody}>
        我们是你一直都在寻找的合作伙伴吗?{' '}
        <Link to="/contact" className={styles.contactLink}>
          聊一聊你的项目
        </Link>.
      </Section>
    </Layout>
  );
};

About.propTypes = {
  data: PropTypes.object.isRequired,
  transitionStatus: PropTypes.string.isRequired,
};

export default About;

export const pageQuery = graphql`
    query AboutQuery {
        page: allMarkdownRemark(
            filter: { frontmatter: { templateKey: { eq: "about" } }}
        ) {
            edges {
                node {
                    frontmatter {
                        title
                        ledeHtml
                        statsLedeHtml
                        stats {
                            number
                            metric
                            description
                        }
                        clients
                    }
                }
            }
        }
    }
`;
