/* global document window */

import React, { Component } from "react"
import PropTypes from "prop-types"
import { graphql } from "gatsby"
import posed from "react-pose"
import classnames from "classnames"
import { withWindowSizeListener } from "react-window-size-listener"

import Layout from "components/Layout"
import Arrow from "components/Arrow"
import Link from "components/Link"
import Section from "components/Section"
// import SEO from "components/SEO"
// import Brush from "components/Brush"
import { lteSmallViewport } from "lib/media-query"

import styles from "./styles.module.css"

const AccordionContent = posed.li({
  closed: {
    height: lteSmallViewport() ? "6rem" : "9rem",
    transition: {
      type: "tween",
      ease: "easeInOut",
      duration: 200,
    },
  },
  open: {
    height: "auto",
    transition: {
      type: "tween",
      ease: "easeInOut",
      duration: 200,
    },
  },
})

class Approach extends Component {
  static propTypes = {
    data: PropTypes.object.isRequired,
    windowSize: PropTypes.shape({
      windowWidth: PropTypes.number,
      windowHeight: PropTypes.number,
    }),
    transitionStatus: PropTypes.string.isRequired,
  }

  static defaultProps = {
    windowSize: {
      windowWidth: 0,
      windowHeight: 0,
    },
  }

  state = {
    activeService: [],
  }

  componentDidUpdate(prevProps) {
    const { windowSize: { windowWidth } } = this.props
    if (prevProps.windowSize.windowWidth !== windowWidth) {
      document.querySelectorAll("[data-service]").forEach((el) => {
        if (!el.classList.contains(styles.open)) {
          // eslint-disable-next-line no-param-reassign
          el.style.height = lteSmallViewport() ? "6rem" : "9rem"
        }
      })
    }
  }

  toggleService = index => () => {
    const { activeService } = this.state

    const newActiveService = [...activeService]
    let state
    if (activeService.includes(index)) {
      newActiveService.splice(newActiveService.indexOf(index), 1)
      state = 0
    } else {
      newActiveService.push(index)
      state = 1
    }

    this.setState({ activeService: newActiveService }, () => {
      if (lteSmallViewport() && state === 1) {
        document.querySelector(`[data-service="${index}"]`).scrollIntoView(true)
        window.scrollBy(0, -146)
      }
    })
  }

  render() {
    const { data, transitionStatus } = this.props
    const { activeService } = this.state

    return (
      <Layout transitionStatus={transitionStatus}>
        {/*<SEO title="Our Approach"/>*/}

        <h1 className={styles.heroText}>
          {/*Our <Brush number={5}>not-so-secret</Brush> formula for building products*/}
          that customers love.
        </h1>

        <section className={styles.lede}>
          <div>
            <p>
              Building good products isn&rsquo;t magic: it&rsquo;s all about
              listening to your customers, working iteratively, and testing
              constantly. Short cycles and regular feedback keeps our minds open to
              changing directions and experimenting every step of the way.
            </p>
            <p>
              The right product is the one created with your and your
              customers&rsquo; goal in mind; we&rsquo;re here as the experienced
              team that has the tools and processes necessary to do the work and
              get results.
            </p>
          </div>
        </section>

        <Section title="Formula" className={styles.formula} contentClassName={styles.formulaBody}>
          <div>
            <h2>We follow three
              {/*<Brush number={4}>basic</Brush> */}
              but impor&shy;tant rules when working with our clients.
            </h2>
            <Link to="/about">About Us <Arrow color="red" size="1.25rem" className={styles.arrow}/></Link>
          </div>
          <ul className={styles.formulaItems}>
            <li>
              <h3>The <span>user</span> comes first</h3>
              <p>
                Before building anything, we work to understand the who, what, and
                why. Who are we building for? What is the problem we’re solving?
                And why is this the solution they need? Having answers to these
                questions early in the process allows us to build products that
                enhance capabilities, bring happiness, and simplify process.
              </p>
            </li>
            <li>
              <h3><span>Foundation</span> over fads</h3>
              <p>
                Trends come and go, especially when it comes to technology. This is
                why we rely on research, user insights, best practices, and years
                of experience to guide us in developing every part of your product.
                Our goal isn’t to create something fleeting, but something that
                will stand the test of time as user’s needs and technology change.
              </p>
            </li>
            <li>
              <h3>Collaborate early &amp; <span>often</span></h3>
              <p>
                Getting input from users and stakeholders at every stage of the
                process is key to building a successful product. By constantly
                checking in and validating assumptions, we ensure that your product
                will not only be useful, but met with joy and anticipation.
              </p>
            </li>
          </ul>
        </Section>

        <Section title="Services" className={styles.services} contentClassName={styles.content}>
          <ul>
            {data.services.edges.map(({ node: service }, idx) => (
              <AccordionContent
                pose={activeService.includes(idx) ? "open" : "closed"}
                onClick={this.toggleService(idx)}
                data-service={idx}
                className={classnames(styles.accordionItem, {
                  [styles.open]: activeService.includes(idx),
                  [styles.allClosed]: !activeService.length,
                })}
                key={`service${idx}`}
              >
                <h2>{service.frontmatter.title}</h2>
                <div
                  className={styles.serviceInfo}
                  dangerouslySetInnerHTML={{ __html: service.html }}
                />
                <div className={styles.serviceImage}>
                  {service.frontmatter.image && (
                    <img src={service.frontmatter.image.publicURL} alt={service.frontmatter.title}/>
                  )}
                </div>
              </AccordionContent>
            ))}
          </ul>
        </Section>

        <Section title="Contact" className={styles.contact} contentClassName={styles.contactBody}>
          Are we the partners you&rsquo;ve been searching for?{" "}
          <Link to="/contact" className={styles.contactLink}>
            Tell us about your project
          </Link>.
        </Section>
      </Layout>
    )
  }
}

export default withWindowSizeListener(Approach)

export const pageQuery = graphql`
    query ApproachQuery {
        services: allMarkdownRemark(
            sort: { order: ASC, fields: [frontmatter___sort] },
            filter: { frontmatter: { templateKey: { eq: "services" } }}
        ) {
            edges {
                node {
                    html
                    frontmatter {
                        title
                        image {
                            publicURL
                        }
                    }
                }
            }
        }
        process: allMarkdownRemark(
            sort: { order: ASC, fields: [frontmatter___sort] },
            filter: { frontmatter: { templateKey: { eq: "process" } }}
        ) {
            edges {
                node {
                    html
                    frontmatter {
                        title
                    }
                }
            }
        }
    }
`
