/* global window IntersectionObserver */
import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {graphql} from 'gatsby';
import Layout from 'components/Layout';
import classnames from 'classnames';
import chroma from 'chroma-js';
import VisibilitySensor from 'react-visibility-sensor';

import Link from 'components/Link';
// import SEO from 'components/SEO';
import {supportsWebMAlpha} from 'lib/feature-check';

// This comes first so that each module's css below loads after this css
import Arrow from 'components/Arrow';
import {customProperties} from 'styles/variables.module.css';

import Text from './modules/Text';
import Stats from './modules/Stats';
// import Quote from './modules/Quote';
// import Carousel from './modules/Carousel';
import Image from './modules/Image';
import ImageGrid from './modules/ImageGrid';
import StyleGuide from './modules/StyleGuide';

// import * as Heroes from './heroes';

import styles from './styles.module.css';

const modules = {
  text: Text,
  stats: Stats,
  // quote: Quote,
  // carousel: Carousel,
  image: Image,
  // imagegrid: ImageGrid,
  styleguide: StyleGuide,
};

const ProjectTemplate = ({
                           primaryColor,
                           sections,
                         }) => (
  <Fragment>
{/*    <div className={classnames(styles.container, 'fullWidth')}>
      <div className={styles.content}>
        {sections.map((section, idx) => (
          modules[section.type]
            ? React.createElement(modules[section.type], {
              ...section,
              primaryColor,
              className: styles.section,
              key: `${section.type}-${idx}`,
            })
            : (<span key={`unknown-${idx}`} />)
        ))}
      </div>
    </div>*/}

    {/* SVG for list bullets */}
{/*    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" style={{display: 'none'}}>
      <symbol viewBox="0 0 11 16" id="bullet">
        <g transform="translate(1, -9)" fillRule="nonzero">
          <path
            d="M-9.76996262e-14,9 L-9.76996262e-14,19.9259596 L8.7407677,19.9259596 M4.60765264,15.0207133 L9.34530199,20.0103566 L4.60765264,25"
            fill="none"
            strokeWidth="1"
            stroke={
              chroma.contrast(
                customProperties['--c--page-background'],
                primaryColor,
              ) < 4.5
                ? customProperties['--c--text']
                : primaryColor
            }
          />
        </g>
      </symbol>
    </svg>*/}
  </Fragment>
);

ProjectTemplate.propTypes = {
  primaryColor: PropTypes.string.isRequired,
  sections: PropTypes.array.isRequired,
};

export {ProjectTemplate};

class Project extends Component {
  static propTypes = {
    data: PropTypes.object.isRequired,
    transitionStatus: PropTypes.string.isRequired,
  }

  state = {
    hideHeader: false,
    entered: false,
    useApngFallback: false,
  }

  constructor(props) {
    super(props);

    if (typeof window !== 'undefined') {
      supportsWebMAlpha((isSupported) => {
        if (!isSupported) {
          if (this.hasMounted) {
            this.setState({useApngFallback: true});
          } else {
            this.state = {...this.state, useApngFallback: true};
          }
        }
      });
    }
  }

  componentDidMount() {
    this.hasMounted = true;

    this.observer = new IntersectionObserver((entries) => {
      const entry = entries[0];

      if (
        entry.intersectionRatio === 0
        && !this.hero.isContinuous
        && this.hero.reset
      ) {
        this.hero.reset();
      }

      if (entry.intersectionRatio >= 0.6
        && this.hero
        && !this.hero.isContinuous
        && this.hero.replay
      ) {
        this.hero.replay();
      }
    }, {threshold: [0, 0.6]});

    this.observer.observe(this.header);

    this.setState({entered: true});
  }

  componentDidUpdate(prevProps) {
    const {transitionStatus: prevTransitionStatus} = prevProps;
    const {transitionStatus} = this.props;

    if (prevTransitionStatus !== transitionStatus
      && ['exiting', 'exited'].includes(transitionStatus)
    ) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({entered: false});
    }
  }

  componentWillUnmount() {
    this.setState({entered: false});
    this.observer.disconnect();
  }

  onHeroVisibilityChange = (visible) => {
    this.setState({hideHeader: !visible});
  }

  render() {
    const {
      data: {project, next},
      transitionStatus,
    } = this.props;
    const {hideHeader, entered, useApngFallback} = this.state;
    const {title, workType} = project.frontmatter;

    const heroName = title.match(/[a-z0-9]+/gi)
      .map(word => word.charAt(0).toUpperCase() + word.substr(1).toLowerCase())
      .join('');

    return (
      <Layout
        light
        key={`apng-${useApngFallback}`}
        contentBefore={(
          <div
            style={{
              display: hideHeader ? 'none' : 'block',
              maxHeight: typeof window !== 'undefined' ? window.innerHeight : '',
              backgroundColor: project.frontmatter.primaryColor,
            }}
            className={classnames(
              styles.hero,
              'fullWidth',
              entered && styles.entered,
            )}
          >
            <div
              className={classnames(
                styles.heroVisual,
                entered && styles.entered,
              )}
            >
  {/*            {Heroes[heroName] && React.createElement(
                Heroes[heroName],
                {
                  ref: (hero) => {
                    this.hero = hero;
                  },
                  transitionStatus,
                  useApngFallback,
                },
              )}*/}
            </div>
            <div
              className={classnames(
                styles.heroWrap,
                entered && styles.entered,
              )}
            >
              <h1><span>{title}</span></h1>
              <ul className={styles.workType}>
                {workType.map((type, idx) => <li key={`type${idx}`}><span>{type}</span></li>)}
              </ul>
            </div>
          </div>
        )}
        outerClassName={styles.outer}
        transitionStatus={transitionStatus}
      >
{/*        <SEO
          title={project.frontmatter.title}
          description={project.frontmatter.summary}
          ogImage={project.frontmatter.hero.childImageSharp.fluid.src}
        />*/}
        <VisibilitySensor partialVisibility resizeCheck onChange={this.onHeroVisibilityChange}>
          <div
            className={styles.heroFill}
            ref={(header) => {
              this.header = header;
            }}
          />
        </VisibilitySensor>
        <ProjectTemplate
          {...project.frontmatter}
          content={project.html}
          sections={project.sections}
        />
        <div className={styles.next}>
          <Link to={next.fields.slug}>
            <h2>{next.frontmatter.title}</h2>
            <h3>Next Project <Arrow size="0.9rem" color={next.frontmatter.primaryColor} /></h3>
          </Link>
        </div>
      </Layout>
    );
  }
}

export default Project;

export const ProjectQuery = graphql`
    query Project($id: String!, $next: String!) {
        project: markdownRemark(id: { eq: $id }) {
            html
            frontmatter {
                title
                summary
                workType
                primaryColor
            }
        }
        next: markdownRemark(id: { eq: $next }) {
            fields {
                slug
            }
            frontmatter {
                title
                subtitle
                primaryColor
                hero {
                    publicURL
                }
            }
        }
    }
`;
