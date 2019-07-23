/* global window */
import React from 'react';
import {StaticQuery, graphql} from 'gatsby';
import {OutboundLink} from 'gatsby-plugin-google-analytics';

import Arrow from 'components/Arrow';
import Link from 'components/Link';

import {ReactComponent as Logo} from '../../img/logo-full.svg';

import styles from './styles.module.css';

export default () => (
  <footer className={styles.container}>
    <section className={styles.about}>
      <h3>关于</h3>
      <p>
        采撷于2015年在北京成立，是一家专注于产品开发的数字公司。团队由来自各知名企业的设计师、开发人员和产品专家组成。
      </p>
    </section>
{/*    <section className={styles.newbiz}>
      <h3>New Business</h3>
      <address>
        Haley Lloyd<br />
        New Business Lead<br />
        +1 347 706 4006<br />
        <OutboundLink href="mailto:haley@planetary.co">haley@<span>planetary.co</span></OutboundLink>
      </address>
    </section>*/}
    <section className={styles.newbiz}>
      <h3>公司</h3>
      <ul>
        <li><Link to="/careers">合伙</Link></li>
        <li><Link to="/insights">见解</Link></li>
        <li><Link to="/about">关于我们</Link></li>
      </ul>
    </section>
    <section className={styles.join}>
      <h3>加入我们</h3>
      <OutboundLink href="mailto:careers@caixie.top">careers@<span>caixie.top</span></OutboundLink>

      <h3>其他</h3>
      <OutboundLink href="mailto:team@planetary.co">team@<span>caixie.top</span></OutboundLink>
    </section>
    <section className={styles.work}>
      <h3>我们的工作</h3>
      <ul>
        <StaticQuery
          query={graphql`
                        query ProjectQuery {
                            projects: allMarkdownRemark(
                                sort: { order: DESC, fields: [frontmatter___title] },
                                filter: { frontmatter: { templateKey: { eq: "project" } }}
                            ) {
                                edges {
                                    node {
                                        fields {
                                            slug
                                        }
                                        frontmatter {
                                            title
                                        }
                                    }
                                }
                            }
                        }
                    `}
          render={data => data.projects.edges.map((project, idx) => (
            <li key={idx}>
              <Link to={project.node.fields.slug}>
                {project.node.frontmatter.title}
              </Link>
            </li>
          ))}
        />
      </ul>
    </section>
    <section className={styles.internet}>
      <h3>社交网络</h3>
      <ul>
        <li><OutboundLink href="https://twitter.com/plntary">Twitter</OutboundLink></li>
        <li><OutboundLink href="https://instagram.com/planetarycorp">Instagram</OutboundLink></li>
      </ul>
    </section>
    <section className={styles.logo}>
      <Logo title="Planetary" />
    </section>

{/*    <section className={styles.address}>
      <h3></h3>
      <address>
        Planetary Corporation<br />
        500 Waverly Ave #2G<br />
        New York, NY 11238
      </address>
    </section>*/}
    <section className={styles.gap}>
      &nbsp;
    </section>
    <section className={styles.backToTop}>
      <a
        href="#top"
        onClick={(evt) => {
          evt.preventDefault();
          window.scroll({top: 0, left: 0, behavior: 'smooth'});
        }}
      >
        回到顶部
        <Arrow
          color="red"
          direction="up"
          className={styles.arrow}
        />
      </a>
    </section>
    <div className={styles.copyright}>
      &copy; 2019 北京采撷科技
    </div>
  </footer>
);
