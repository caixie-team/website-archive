/* global window */
import React from 'react';
import {StaticQuery, graphql} from 'gatsby';
import {OutboundLink} from 'gatsby-plugin-google-analytics';

import Arrow from 'components/Arrow';
import Link from 'components/Link';

import {ReactComponent as Logo} from '../../images/logo-full.svg';

import styles from './styles.module.css';

export default () => (
  <footer className={styles.container}>
    <section className={styles.about}>
      <h3>About</h3>
      <p>
        Founded in NYC in 2013, Planetary is a digital studio specializing in
        product development. Its creative team is made up of designers, developers,
        and product experts working all around the world.
      </p>
    </section>
    <section className={styles.newbiz}>
      <h3>New Business</h3>
      <address>
        Haley Lloyd<br />
        New Business Lead<br />
        +1 347 706 4006<br />
        <OutboundLink href="mailto:haley@planetary.co">haley@<span>planetary.co</span></OutboundLink>
      </address>
    </section>
    <section className={styles.join}>
      <h3>Join Us</h3>
      <OutboundLink href="mailto:careers@planetary.co">careers@<span>planetary.co</span></OutboundLink>

      <h3>Everything Else</h3>
      <OutboundLink href="mailto:team@planetary.co">team@<span>planetary.co</span></OutboundLink>
    </section>
    <section className={styles.work}>
      <h3>Our Work</h3>
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
      <h3>Internet</h3>
      <ul>
        <li><OutboundLink href="https://twitter.com/plntary">Twitter</OutboundLink></li>
        <li><OutboundLink href="https://instagram.com/planetarycorp">Instagram</OutboundLink></li>
      </ul>
    </section>
    <section className={styles.logo}>
      <Logo title="Planetary" />
    </section>
    <section className={styles.studio}>
      <h3>Studio</h3>
      <ul>
        <li><Link to="/careers">Careers</Link></li>
        <li><Link to="/insights">Insights</Link></li>
        <li><Link to="/about">About Us</Link></li>
      </ul>
    </section>
    <section className={styles.address}>
      <h3>Address</h3>
      <address>
        Planetary Corporation<br />
        500 Waverly Ave #2G<br />
        New York, NY 11238
      </address>
    </section>
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
        Back to Top
        <Arrow
          color="red"
          direction="up"
          className={styles.arrow}
        />
      </a>
    </section>
    <div className={styles.copyright}>
      Copyright &copy; 2019 Planetary Corporation
    </div>
  </footer>
);
