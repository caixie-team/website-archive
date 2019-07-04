/* global document IntersectionObserver */

import React, { Component } from "react"
import ReactDOM from "react-dom"
import PropTypes from "prop-types"
import classnames from "classnames"
import { graphql, withPrefix } from "gatsby"
import Scrollbar from "react-scrollbars-custom"
import { withWindowSizeListener } from "react-window-size-listener"
import anime from "animejs"
import normalizeWheel from "normalize-wheel"

import Layout from "components/Layout"
import Link from "components/Link"
// import SEO from 'components/SEO';
import Transition from "components/Transition"
// import Brush from 'components/Brush';
import Arrow from "components/Arrow"
import { lteSmallViewport, isTouchDevice } from "lib/media-query"

import styles from "../styles/index.module.css"

// import { ReactComponent as Cursor } from "../images/dragcursor.svg"
import { ReactComponent as Cursor } from "../images/cursor.svg"

// import starUrl, { ReactComponent as Star } from '../images/cursor.svg'
class Index extends Component {
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
    projectActive: null,
    backgroundColor: null,
    dragging: false,
    showDragger: false,
    showHover: false,
  }

  projects = {}

  constructor(props) {
    super(props)

    this.scrollbars = React.createRef()
    this.transition = React.createRef()
    this.cursor = React.createRef()
  }

  componentDidMount() {
    document.addEventListener("wheel", this.onMouseWheel, { passive: false })

    this.intersectRatio = lteSmallViewport() ? 0.5 : 0.9
    this.intersects = []

    this.observer = new IntersectionObserver((entries) => {
      if (!lteSmallViewport()) {
        return
      }

      const { projectActive } = this.state

      entries.forEach((entry) => {
        const index = entry.target.idx ? parseInt(entry.target.idx, 10) : null

        if (
          entry.intersectionRatio >= this.intersectRatio
          && !this.intersects.includes(index)
        ) {
          this.intersects.push(index)
        } else if (
          entry.intersectionRatio < this.intersectRatio
          && this.intersects.includes(index)
        ) {
          this.intersects.splice(this.intersects.indexOf(index), 1)
        }
      })

      if (
        this.intersects.length
        && this.intersects[this.intersects.length - 1] !== projectActive
      ) {
        this.onProjectEnter(this.intersects[this.intersects.length - 1])()
      } else if (!this.intersects.length) {
        clearTimeout(this.projectAnimate)
        this.setState({ projectActive: null })
      }
    }, { root: ReactDOM.findDOMNode(this.contentArea), threshold: [this.intersectRatio] })

    Object.entries(this.projects).forEach(([idx, ref]) => {
      const node = ReactDOM.findDOMNode(ref)
      node.idx = idx // eslint-disable-line no-param-reassign
      this.observer.observe(node)
    })
    this.observer.observe(ReactDOM.findDOMNode(this.intro))
    this.observer.observe(ReactDOM.findDOMNode(this.end))
  }

  componentDidUpdate(prevProps) {
    const { windowSize: { windowWidth } } = this.props
    if (prevProps.windowSize.windowWidth !== windowWidth) {
      this.intersectRatio = lteSmallViewport() ? 0.5 : 0.9
    }
  }

  componentWillUnmount() {
    this.unmounting = true
    clearTimeout(this.dragEndTimeout)
    clearTimeout(this.projectAnimate)
    document.removeEventListener("wheel", this.onMouseWheel, { passive: false })
    this.observer.disconnect()
    document.body.style["overflow-x"] = ""
  }

  animateProjectBackground = async (index) => {
    if (this.unmounting) {
      return
    }

    const { data } = this.props
    const { projectActive, currentProjectImage, animating } = this.state

    const projects = data.projects.edges
    if (!animating) {
      const nextProjectImage = projects[index]
        ? projects[index].node.frontmatter.hero.publicURL
        : null

      if (nextProjectImage === currentProjectImage) {
        return
      }

      this.setState({ animating: true })
      const done = await this.transition.current.setImages(
        currentProjectImage,
        nextProjectImage,
      )
      // The component may unmount between the previous action and this one
      if (!this.transition.current) {
        return
      }
      await this.transition.current.animateTo(Transition.B)
      this.setState({
        animating: false,
        currentProjectImage: nextProjectImage,
      }, () => {
        const { projectActive: currentProjectActive } = this.state
        if (currentProjectActive !== projectActive) {
          this.animateProjectBackground(currentProjectActive)
        }
      })
    }
  }

  exit = async (opts, node) => {
    document.body.style["overflow-x"] = "hidden"
    anime({
      targets: node,
      opacity: 0,
      duration: 1000,
      delay: 3500,
      easing: "easeInOutQuad",
    })
  }

  isExiting = () => {
    const { transitionStatus } = this.props
    return ["exiting", "exited"].includes(transitionStatus)
  }

  onElementEnter = () => {
    this.animateProjectBackground(null)
    this.setState({
      showHover: true,
      projectActive: null,
      backgroundColor: "#23282e",
    })
  }

  onElementLeave = () => {
    this.setState({
      showHover: false,
      backgroundColor: null,
    })
  }

  onProjectEnter = index => () => {
    if (this.scrolling || this.isExiting()) {
      return
    }
    this.setState({
      projectActive: index,
    })
    clearTimeout(this.projectAnimate)
    this.projectAnimate = setTimeout(async () => {
      this.animateProjectBackground(index)
    }, 150)
  }

  onProjectLeave = () => {
    if (this.isExiting()) {
      return
    }

    clearTimeout(this.projectAnimate)
    this.setState({ projectActive: null })
  }

  onProjectListEnter = () => {
    this.setState({ showDragger: true })
  }

  onProjectListLeave = (evt) => {
    if (this.isExiting()) {
      return
    }

    this.onProjectLeave()
    this.onProjectDragEnd(evt)
    this.setState({ showDragger: false, projectActive: null })
  }

  onProjectDragStart = (evt) => {
    this.setState({
      showDragger: true,
    })
    this.dragOrigin = evt.clientX
  }

  onProjectDrag = (evt) => {
    const { showDragger } = this.state
    if (!showDragger) {
      this.setState({ showDragger: true })
    }

    this.cursor.current.style.transform = `
            translate(
                calc(${evt.clientX}px - 50%),
                calc(${evt.clientY}px - 50%)
            )
        `

    if (!this.dragOrigin) {
      return
    }

    const deltaX = this.dragOrigin - evt.clientX

    const { dragging } = this.state
    if (Math.abs(deltaX) > 10 && !dragging) {
      this.setState({ dragging: true })
    } else if (!dragging) {
      return
    }

    evt.preventDefault()

    const currentScrollDelta = this.scrollbars.current.scrollLeft
    this.scrollbars.current.scrollTo(
      Math.min(
        Math.max(0, currentScrollDelta + deltaX),
        this.scrollbars.current.scrollWidth,
      ),
    )

    this.dragOrigin = evt.clientX
  }

  onProjectDragEnd = () => {
    this.dragEndTimeout = setTimeout(() => {
      this.setState({ dragging: false })
      this.dragOrigin = null
    }, 100)
  }

  checkDragging = (evt) => {
    const { dragging } = this.state
    if (dragging) {
      evt.preventDefault()
    }
  }

  onMouseWheel = (evt) => {
    evt.preventDefault()
    evt.stopPropagation()
    const norm = normalizeWheel(evt)

    const currentScrollDelta = this.scrollbars.current.scrollLeft
    const axis = Math.abs(norm.pixelX) > Math.abs(norm.pixelY) ? "pixelX" : "pixelY"
    // this.scrollbars.current.scrollTo(0, currentScrollDelta + norm[axis])
    this.scrollbars.current.scrollTo(currentScrollDelta + norm[axis])
  }

  render() {
    const { data, windowSize: { windowWidth, windowHeight } } = this.props
    const {
      projectActive, showDragger, showHover, dragging, backgroundColor,
    } = this.state

    const projects = data.projects.edges

    return (
      <Layout hideFooter outerClassName={styles.outer}>
        {/*<SEO title="Digital & Web Product Studio in Brooklyn, NYC" />*/}

        <div
          ref={this.cursor}
          className={classnames(
            styles.cursor, {
              [styles.show]: showDragger,
              [styles.hover]: !dragging && (projectActive !== null || showHover),
            },
          )}
        >
          <Cursor/>
        </div>
        <div
          className={styles.work}
          onMouseDown={this.onProjectDragStart}
          onMouseMove={this.onProjectDrag}
          onMouseUp={this.onProjectDragEnd}
          onMouseEnter={isTouchDevice() ? null : this.onProjectListEnter}
          onMouseLeave={isTouchDevice() ? null : this.onProjectListLeave}
          onDragStart={(evt) => {
            evt.preventDefault()
            return false
          }}
          draggable={false}
          ref={(ref) => {
            this.contentArea = ref
          }}
          role="presentation"
        >
          <Scrollbar
            noDefaultStyles
            className={styles.scroller}
            momentum={false}
            noScrollY={!lteSmallViewport()}
            trackYProps={{
              renderer: props => {
                const { elementRef, ...restProps } = props
                return <div ref={elementRef} {...restProps} className={styles.vTrack}/>
              },
            }}
            trackXProps={{
              renderer: props => {
                const { elementRef, ...restProps } = props
                return <div
                  ref={elementRef}
                  {...restProps}
                  className={styles.hTrack}
                  onMouseEnter={() => {
                    this.setState({ showDragger: false })
                  }}
                  onMouseLeave={() => {
                    this.setState({ showDragger: true })
                  }}
                />
                // return <div ref={elementRef} {...restProps} className={styles.vTrack}/>
              },
            }}

            thumbXProps={{
              renderer: props => {
                const { elementRef, ...resetProps } = props
                return <div ref={elementRef} {...resetProps} className={styles.hThumb}/>
              },
            }}

            wrapperProps={{
              renderer: props => {
                const { elementRef, ...restProps } = props
                return <div
                  ref={elementRef}
                  {...restProps}
                  className={styles.scrollerWrapper}
                />
              },
            }}
            contentProps={{
              renderer: props => {
                const { elementRef, ...restProps } = props

                return <div
                  ref={elementRef}
                  {...restProps}
                  className={classnames(styles.scrollerContent, {
                    [styles.hasActive]: projectActive !== null,
                  })}
                />
              },
            }}
            key="scrollbars"
            // ref={ref => (this.scrollbars = ref)}
            ref={this.scrollbars}
          >
            <div
              className={classnames(
                styles.project,
                styles.intro,
                {
                  [styles.exiting]: this.isExiting(),
                },
              )}
              ref={(intro) => {
                this.intro = intro
              }}
            >
              <div className={styles.wrap}>
                <h1>
                  {/*
                  <strong
                    className="styles-module--brush--3buen styles-module--brush3--rPKJB styles-module--animate--3lXLb">
                    <svg viewBox="0 0 363 91">
                      <defs>
                        <clipPath id="brush3_svg__a">
                          <path
                            d="M191.4 23.7c.3-.3 1.5-.5 1.7-.9 1.4.4 1.9.3 4.5-.1-.4.9-3.5.2-6.2 1zm-1.9-.8c-2.4 0-6.8 1.8-9 .7 4.3-.6 6.1-.8 7.1-1.7 1.1.2 1.7.5 4.5 0-.9.4-2.4.7-2.6 1.2-1 .1-.5-.2 0-.2zm29.5-3c-1.3-.5-.1-.7 1.8-.8 1.9-.1 4.6 0 6.2-.3-.6.3-2.1.3-1.8.8-1.8-.1-5.5-.7-6.2.3zm-49.1 47.2c8-2.4 17.6-2.7 26.6-4.2-3.6 1.3-19.2 2.5-26.6 4.2zM70.2 47.8c-1.1.2-2.2.3-1.9-.2-5.3.8-6.8 2-11.7 2.8.4.5 1.1.9 2.9.8 1.5-.9 4.3-2.4 7.2-1.9.1-.5.5-.9 1.7-1.3 0 .3 1.6.1 1.8-.2zm-14.5 2.8c-3.9.5-2.3 2 .1 1 .1.3.4.5 1.9.2.2-.8-2.2-.5-2-1.2zm42.9-8.7c1.8 0 7.7-1.2 7.9-2.1-1.9.7-7.4 1.1-7.9 2.1zm11.5-2.7c3.9-.8 12.2-2.4 10.5-2.9-3.3.9-8.6 1.7-10.5 2.9zm-11-.1c-1.8 1.4-7.1 2.5-11.9 3.5-4.8 1-9.1 1.9-9 3.1 4-1.1 3.3-1 7.2-1.3-.9-1.4 3.2-.9 4.2-2 1.2-.2.9.3 1.9.2 2.8-.9 2.4-1.4 7-1.7.8-1.3 6.1-1.3 9.6-2.6l-.1-.5c-.5.1-1.1.1-.9-.1-2.4.6-3.1 1.4-6.1 2-.1-.4-2.5.1-1.9-.6zm42.5-8.3c-.1-.7-2-.7-2.9-1l-4.5.7c-.1.8-3 1.2-5.2 1.8-.4-.5-1.9-.7-.2-1.4-1.8 1-4.6 2.4-2.3 2.6-1.8-.2-2 .6-3.5 1.1 1.1 0 10.7-1.7 4.4-1.2 6.2-.7 8.7-2.1 14.2-2.6zm-7.3 56.9c.9-.9-6.8-.1-7.2.2 3.3 0 2.7.1 7.2-.2zm173-81.8c-1.1-.2-2.3-.4-3.4-.5l-1.8-.2-.9-.2-.8-.1c.1.1.4.1.9.2s1.2.2 2 .3c1.5.3 3.5.6 5.4.9 3.8.6 7.5 1.3 8.1 1.1-4.8-1-7.4-1.4-9.5-1.5zm13 44.3c-5.7-.5-20.2 1.4-26.2 2.4 9.5-.6 16.4-1.7 26.2-2.4zm-57.6 5.6c2.1-.1 9.5-.5 12.5-1.6-4.3.7-23 2.3-12.5 1.6zm-11 21.9c8.1.1 27.4-2 38-1.6-13.8.8-21.5 1.3-36.2 2.4.1.5 3.8-.2 5.4-.1-44.8 3.4-73.7 5.1-111.2 7.7-2.9.4-1.6.9-2.6 1.1l-19 1.3c.9-1.3-2.7-1-4.6-1.4-2.5 0 .7 1.1-1.7 1.1.2.5 2.3.4 4.5.2-12.3 1.1-27.4 2.2-43.6 2.5-4.1 0-8.2.1-12.4 0-2.1 0-4.2-.1-6.3-.2-2.1-.1-4.3-.2-6.2-.3-1.9-.2-3.6-.4-4.9-.8-1.3-.4-2.4-1-2.9-1.5-.6-.6-1.1-1.4-1.3-2-.1-.3-.1-.4-.1-.4h-.1.1v-.1c-.2-.2 0-.3.3-.6.4-.3.9-.7.4-.9 1-.3 2.2-.7 3.7-1.1 1.5-.4 3.1-.9 4.6-1.4l9-3c6.1-2 12.2-4.1 19.1-5.5-2.1-.3 3.2-.7 5.9-2.2 2.2-.5 1.1-.1 1 .3 24.9-6.1 51.1-10.6 75.5-14.4 24.4-3.7 46.9-6.6 64.8-9.1 7.3-.3 15.3-1 25.2-2.7 16.1-1.5 34.1-2.6 48.6-5.6.4.4-.7.5-1.8.6 7.4-.3 19.9-1.4 28.9-2.7 2-.2-1.2-.5-.1-1.2 1.9-.3 6-.3 6.3-.9 4.2.3-5.2.6-3.5 1.4 3 0 6.1-.4 9.3-1.1.8-.2 1.6-.4 2.5-.7.2-.1.5-.2.7-.3.2-.1.3-.1.5-.2s.3-.2.7-.4l.2-.2s.1 0 .1-.1c.1-.1.1-.2.2-.2.3-.3.5-.9.5-.9.1-.3.2-.6.2-.9.1-.6-.1-1.2-.2-1.7-.4-.9-.8-1.4-1.2-1.8-.4-.4-.8-.7-1.2-.9-.8-.5-1.5-.9-2.2-1.2-3.2-1.9-6.5-3.2-10-4.4-3.4-1.2-6.9-2.2-10.5-3.2-7.1-1.8-14.3-3.3-21.5-4-1.8-.2-3.6-.3-5.3-.4-1.7-.1-3.5-.2-5.2-.3-1.7-.1-3.4-.2-5-.3-1.7-.1-3.3-.1-4.9-.1-3.2-.1-6.3-.2-9.2-.3-2.9 0-5.7-.1-8.3-.1-1.6.6 4 .6.9.8-1.5-.1-1.7.1-1.8.4-3.3-.3.4-.7-1.8-1.3-2.2 0-4.2.1-6.1.2-1.9.1-3.7.1-5.4.2-1.7.1-3.3.1-4.8.2s-3 .2-4.4.2c-2.8.2-5.5.3-8.1.6-2.7.3-5.4.6-8.4 1.1 2-1-1.6.1-2.7-.4-3.5.8-5.6 2-11.6 2.4-.3-.8 5.7-.8 8-1.7-6.3.4-12.2.7-18.2 1.5-3 .4-6 .8-9.1 1.4-3.1.6-6.2 1.3-9.5 2.2 1 .9 5.4-.9 5.5.2-3.1.8-5.8 1.3-8.5 1.8s-5.4.7-8.4.8c.2-.3 1.8-.4 1.7-.7-.1.2-2.6.6-5 1.1-2.4.5-4.8 1.1-4.6 1.8-4.4-.1-8 .8-8.8 2.4-2.4 0-6.1.6-7.3.1-1 .4.3.5-2.6 1.1 3.6.6 6.1-.2 13.4-1.4 1.6-.7-.6-.4-.2-1.2 3.9-.3.9.8 4.6.6 6.9-1.2 7-1.9 14.2-2.7-1.7 1.9-9.9 2.3-15 3.3-1.3.6-6.3 2-6.1 2-1.2.7-1.9 0-1-.6-8.3 1.5-8.3 2.6-9.5 3.8-2.6.1-3.1-.3-2-1.2-7.1 1.7-18.7 2.8-20 5.8-.9 0-1-.4-2.7 0-1.3 1.4-7.2.9-8.6 2.9-3.6-.4-9.5 1.7-13.2 2.7l-.2-1.2c-5.3 1.2-9.3 2.4-14 3.7 3 .6 8.3-2.1 13.3-2.8-13.2 4.2-25.5 7.4-40.8 11.1 9.2-2.8 17.1-4.6 26.8-7.4-2.2-.2-4.4 1.3-6.3.9-2.5 1-6.9 2.3-11.2 3.3-4.3 1-8.4 1.8-10.4 1.9-2.8 1.8-11.3 3.1-19.4 4.8-3.4-.1 2.7-.8 2.7-1.2-.4-.8-4.4 1.2-3.8-.1 4.4-.5 4.2-.7 5.7-.1-.1-1.1 2.6-.5 2.7-1.5 2-.3 1.8.1 2 .5.6-.7.8-1.6 4.5-1.6-.2-.7-2.4-.5-4.6-.1-2.2.4-4.5 1.1-4.7 1.5-4.8.2-10.6.8-15.2 1.8-2.1.1-2.1-.5-2-1.1-.3.3-7.7-.7-5.6-1.6-6.1-.7-7.4-.3-12.5-1.1 2.9-.6-.8-.3 1.9-1.2-.8-.7-3.8-.9-5.7-1.3-.7-1.1 3.1-.9 3.8-1.6-4.1-.1 1.4-1-4.7-.9 1.5-.5 4.4-.8.1-1.2-.7-.9 3.6-.4 3.8-1.1-.1-.9-2.6-1.2-2.7-2-.4-.6 1.7-.5 1-1.2 8.2-1.2 17.3-2.7 26.9-4.7 9.6-1.9 19.8-4.2 30.2-6.6 8.1-1.9 16.4-3.9 24.8-6 8.4-2 17-4.1 25.7-6.1 17.4-4 35.3-7.7 53.6-10.7 22-3.7 47.9-6.8 71.4-7.9 20.1-1 38.1-.9 55.2.1 2.1.2 4.3.3 6.4.4 1.1.1 2.1.1 3.2.2s2 .1 3.3.3c4.7.5 9 1.2 13.2 2 4.2.8 8.4 1.7 12.6 2.8 4.2 1.1 8.3 2.2 12.7 3.8 2.2.8 4.4 1.6 6.9 2.7 1.3.6 2.6 1.2 4.2 2.2.8.5 1.7 1.1 2.8 1.9.3.2.6.4.9.7.3.3.6.6 1 .9.4.4.7.7 1.1 1.2.2.3.4.5.6.8l.3.4.4.5c.2.4.5.7.7 1.1l.7 1.4.3.8c.1.3.2.7.4 1 .1.3.2.7.3 1 .1.4.2.6.2 1.1.2.8.2 1.7.3 2.5 0 .9 0 1.9-.1 2.8-.1.9-.3 1.8-.6 2.7-.1.4-.3.9-.5 1.3-.1.3-.6 1.3-.9 1.8-.4.7-.8 1.3-1.3 1.9-.5.6-1 1.2-1.5 1.7-.3.2-.5.4-.7.6-.5.4-.9.8-1.5 1.1-.2.2-.5.3-.8.5l-.4.2-.7.4-.7.4-.5.2-.9.3-.6.2-.6.2-.9.2c-1 .3-1.8.4-2.5.6l-2 .4c-2.5.4-4.7.7-6.9 1-8.8 1.1-17.4 1.9-26.6 2.9-18.3 1.8-38.2 3.7-61.1 6.1-36.6 4-80.5 10.2-117 16.2-16.7 2.8 2.7-1 6-1.5 18.4-3.3 35.6-5.8 52.8-8.1 17.2-2.3 34.6-4.4 53.7-6.7-4.5.1-13.1 1-18.8 1.9 15.6-2.4 33.2-4.4 51-6.1 17.8-1.8 35.8-3.2 52.4-5-1.2.8-3.4.5-7.3 1.1 6.4-.2 11.9-.8 18.1-1.7 1.6-.2 3.2-.5 5.2-.9.5-.1 1-.2 1.7-.4l1-.3.6-.2.8-.2.4-.1.6-.2.6-.2.5-.2.5-.3.5-.3.3-.1.4-.2c.7-.5 1.5-1 2.1-1.5l.2-.2.3-.3c.4-.4.8-.8 1.1-1.2.7-.9 1.3-1.8 1.8-2.8.1-.2.2-.5.4-.7l.2-.4.2-.5c.1-.3.2-.6.3-1 .4-1.3.6-2.6.6-4 0-.7 0-1.3-.1-1.9-.1-.6-.2-1.3-.3-1.8-.1-.5-.3-1-.4-1.5-.2-.5-.4-1-.5-1.4-.2-.4-.3-.7-.5-1.1l-.3-.5-.2-.4c-1.4-2.3-2.6-3.4-3.5-4.2-.9-.8-1.7-1.4-2.4-1.9-1.4-1-2.6-1.6-3.7-2.2-2.2-1.1-4.2-2-6.3-2.8 1 .7 2.2 1.3 3.6 2 1.5.7 3.1 1.4 5.4 2.8.6.4 1.3.8 2 1.4.8.6 1.7 1.3 2.9 2.6.3.4.6.8 1 1.2.4.5.7 1.1 1.1 1.6.2.4.4.7.6 1.1l.3.3c.1.2.2.4.3.7.2.5.3 1 .5 1.6.1.5.3 1.1.4 1.8.1.7.1 1.3.1 2s-.1 1.5-.2 2.2c-.1.7-.3 1.4-.5 2.1-.1.4-.2.7-.3 1l-.2.5-.1.2-.2.4c-.1.3-.3.5-.4.8-.6 1-1.3 2.1-2.1 2.9l-.6.6-.3.3-.5.5-1.2.9-.6.4-.4.2c-.7.4-1.7.9-2 1l-.7.3-.5.2c-.3.1-.7.2-.9.3l-.7.2-.6.1c-.8.2-1.4.3-2.1.4-1.2.2-2.4.4-3.6.5-1.6.2-3.7.6-3.9.2l3.9-.5c1-.2 2.1-.4 3.3-.6.6-.1 1.2-.3 2-.4.4-.1.8-.2 1.3-.3l.4-.1.5-.2.5-.2.7-.3.8-.3 1.2-.6.3-.2.5-.3 1.2-.9c.2-.2.4-.3.6-.5l.3-.2.5-.5c.9-.9 1.7-1.9 2.3-3.1.2-.3.3-.6.4-.8.1-.3.3-.6.3-.6l.2-.5c.1-.4.2-.7.4-1.1.2-.7.4-1.5.4-2.3.1-.8.1-1.6.1-2.3 0-.7-.1-1.4-.2-2.1-.5-2.5-1.5-4.4-2.2-5.5l-.6-.9-.5-.7c-.4-.5-.7-.8-1-1.1-1.2-1.2-2.2-1.9-3-2.5-.8-.6-1.6-1-2.2-1.4-2.7-1.5-4.9-2.3-7-3.2-2.1-.8-4.2-1.5-6.2-2.1-8.1-2.5-15.9-4.3-23.9-5.8-4-.7-8.1-1.3-12.4-1.7-3.8-.3-7.6-.5-11.4-.8-1.9-.1-3.7-.2-5.6-.2-1.9 0-3.7-.1-5.5-.1-1.8 0-3.6-.1-5.4-.1-1.8 0-3.6 0-5.3.1 10.3.2 21.4 1.1 33 2.1 6.4.6 12.4 1.7 18.4 2.9 6 1.2 12.1 2.6 18.3 4.3-.7 0-1.3 0-.2.5 2.7.9 5.4 1.8 8.3 3.1 1.5.7 3 1.4 4.8 2.4.9.6 1.9 1.2 3.1 2.2.3.2.7.6 1 .9l.6.6c.2.2.4.4.6.7.2.3.4.5.7.8.3.4.5.7.7 1.1l.2.3.2.4c.1.3.3.5.4.8.1.3.2.5.3.8.1.3.2.7.3 1 .1.3.2.7.3 1 .1.4.2.8.2 1.3.1.4.1.9.1 1.3v1.4c-.1 1-.2 1.9-.5 2.8-.1.5-.3.9-.5 1.3l-.2.4-.2.5c-.2.3-.4.7-.6 1-.4.7-.9 1.3-1.4 1.8l-.4.4-.3.3-.3.3c-.2.2-.5.4-.7.6-.2.2-.5.4-.8.5-.2.2-.6.4-.6.4-.5.3-1 .5-1.5.8-.6.2-1.3.5-1.6.6l-.6.2-.5.1-.8.2c-.5.1-.9.2-1.4.3-1.7.3-3 .5-4.4.7-2.7.4-5.2.7-7.7 1-10 1.1-19.5 2-28.7 3 6.2-.8 12.4-1.5 18.8-2.3 3.2-.4 6.4-.8 9.7-1.2 3.3-.4 6.5-.8 10.2-1.5.9-.2 1.9-.3 3.1-.6.3-.1.6-.1 1-.3l.6-.2.8-.2.5-.2.6-.2.3-.1.5-.2c.3-.2.6-.3.9-.5l.3-.2.5-.3c.3-.2.6-.4.9-.7l.4-.4.2-.2c.1-.1.3-.3.5-.4.6-.7 1.2-1.4 1.7-2.3.2-.4.5-.8.7-1.2l-.2-.3.1-.2c.1-.3.2-.5.3-.8.2-.6.3-1.1.4-1.7.2-1.2.2-2.4.1-3.4-.1-.5-.1-1.1-.2-1.6-.1-.4-.2-.9-.4-1.3-.6-1.7-1.2-2.7-1.8-3.6-1.2-1.7-2.1-2.5-2.9-3.2-1.6-1.3-2.8-2-3.8-2.6-2.2-1.2-4-2-5.8-2.7-1.8-.7-3.6-1.3-5.3-1.9-6.9-2.3-13.7-3.9-20.8-5.3 6.8 1.8 13.7 3.5 21.3 6.1 1.9.6 3.9 1.4 6 2.3 1.1.4 2.2.9 3.3 1.6 1.2.6 2.5 1.3 4.2 2.6l.7.5.8.7c.3.3.6.6.8.9l.9 1.2c.2.3.4.5.5.8l.2.4.3.5c.2.4.4.7.5 1.1.2.4.4 1 .5 1.5.1.3.1.5.2.8.1.3.1.6.1.9.1.6.1 1.2.1 1.9 0 1.4-.3 2.7-.8 4l-.1.2-.1.3c-.2.5-.5 1-.8 1.5-.3.5-.6.9-1 1.4-.2.2-.4.4-.5.6l-.3.3-.2.2c-.6.6-1.4 1.1-2.1 1.6-.7.4-1.6.8-1.9.9l-.7.2-.5.2-.5.1-.4.1c-1 .3-1.6.4-2.3.5-2.6.5-4.7.7-6.9 1-2 .1-1.8.5-1.8.9-6.2.3-12.1.8-18.1 1.3-5.9.5-11.8 1.1-17.5 1.6-43.2 3.8-83.5 7.9-124.7 13.8-20.6 3-41.5 6.4-62.9 10.8-10.7 2.2-21.5 4.7-32.5 7.7-5.5 1.5-10.9 3.1-16.4 4.8-2.7.9-5.4 1.8-8.2 2.7-1.3.5-2.6 1-4 1.4-1.1.4-1.9.8-2 .9 0 0 0 .1-.1 0-.4-.6-.7-1.1-1.1-1.5l-.5-.6c-.1-.2-.3-.4-.5-.6-.3-.3-.5-.6-.8-.9-.2-.2-.5-.4-.6-.6-.1-.1-.4-.3-.4-.3-.1 0-.1-.1-.2-.1h-.1l-.5-.2s.4.2 1.3.1c.8 0 2-.4 2.7-.8.6-.3.8-.5.6-.4-.1.1-.2.2-.4.5-.1.1-.2.3-.3.4l-.1.1c-1.5 2.3 2-3.1 1.7-2.6.1.2.7.6 1.9.8 1.5.3 4 .4 6.8.4h8.2c5.4 0 10.5 0 14.8.7 3.2-.2 10.6-.2 7.1.1-7 .6-13.8.7-20.1.5-3.1-.1-6.2-.2-9.1-.4-1.4-.1-2.8-.2-4.2-.2-1.3-.1-2.3-.2-3.2-.3-.9-.1-1.6-.3-2.1-.4-.3-.1-.4-.2-.6-.2 0 0-.1-.1-.2-.1H51c-.5.7 1-1.6-1.1 1.6v-.1l.1-.1c.3-.4.5-.6.6-.8l-.1.1c-.3.3-1.5.8-2.6 1-.1 0-.3 0-.4.1h-1.1c-.3 0-.6-.1-.5-.1l.4.2s.1 0 .1.1c.2.1.3.2.5.4.5.4 1.1 1 2.1 2.2.2.2.5.6.7.9 0 0 .1-.1.2-.1.2-.1.5-.2.8-.4.4-.2.9-.4 1.4-.6l1.9-.7c10.3-3.7 20.9-6.8 31.5-9.5 21.2-5.4 42.4-9.3 62.6-12.8-17.6 2.3-35.5 5.7-52.6 9.9-8.6 2.1-16.9 4.3-24.9 6.8-4 1.2-7.9 2.5-11.7 3.7-1.9.6-3.8 1.3-5.6 2-1.9.7-3.2 1.2-3.6 1.4-.1 0-.1 0-.1.1l-.5-.6c-.1-.2-.3-.4-.4-.5-.3-.4-.5-.6-.8-.9-.5-.5-.8-.8-1.1-1-.1-.1-.2-.1-.3-.2h-.1l-.5-.2c-.1-.1.1.1.7.1s1.4-.1 2.1-.3c.8-.2 1.4-.6 1.7-.7.3-.2.2-.2 0 .1-.2.2-.3.4-.5.7l-.1.1v.1l.8-1.2h.1l.1.1c.2.1.5.2.8.4.8.2 2 .5 3.5.6.8.1 1.6.1 2.5.2.9.1 1.9.1 2.8.2 3.7.2 7.3.3 10.6.5 15.1.6 30.5-.1 46.1-1.1 15.7-1 31.5-2.2 47.3-3.3 31.6-2.3 63.3-4.4 94.8-5.4-3 .4-5.8.5-7.5.8zM139.1 32.6c1.6-.3 1.8 1.1-.7 1.1.1-.2.9-.4.8-.6-4.1.2-1.1 1.1-4.3 1.4 2.1-1.3-2.3.4-5.4.6 3.3-1.2 6.8-1.8 9.6-2.5zm57.5-11.8c1.5.3 3.7-.5 7.2-.6-2.7 1.1-6.3 1.2-7.9 2.1-2.7-.1 0-1.2.7-1.5zm16.1-1c.8-.1.9 0 .9.2 1.4-.5 1.9-1.7 4.4-1.2 0 .6-3.8.5-2.6 1.4-1.8.1-2.8 0-2.7-.4zm-3.6.5c-1.9-.2 4-1.7 5.3-1.3 0 .7-3.9.8-5.3 1.3zm15.2-2.3v.7c-1.6 0-4.5.4-3.6-.3 1.7-.1 1.9-.4 3.6-.4zm21.6-.9c1 0 .6.5 1.8.5-1.1.5-5.4.2-6.3.8-2.4-.5 2.5-1.2 4.5-.8v-.5zm-6.3.6c-1.6-.2-8.5 0-9 1-1.4-.5-1.9-.4-4.5-.1-.7-.6 1.8-.6 1.8-1 4.6.5 10.4-1.4 11.7.1zm62.9 1.1c3.4.3.9 1.3 1.5 1.9-2.6-.4-2.6-1.7-1.5-1.9zm33.3 6.8c-1.3-.1-3.4-.7-6.1-1.6.7-.3 5.2 1 6.1 1.6zm-66.4-10.8c-.5.2-1 .4-.9.7-.8-.6-3.8-.3-6.4-.2-2.6.1-4.6.2-3.5-.9 3 1.3 8-.5 10.8.4zm75.8 15.3c-.8-.4-2.3-1.1-4.1-1.8-1.8-.7-3.8-1.3-5.7-1.7 1.4.1 3.1.5 3.7.2 1.6.8 2.8 1.2 3.8 1.7 1 .3 1.9.8 2.3 1.6zm-65.9-15.2c.7.2 1.5.3 2.7.4.6.7-1.8.4-1.9.9-1.5-.4-2.2-1.1-.8-1.3zm-6.3-.2c-.1-.5 3.2.1 4.5 0-.4.4-2 .5-1.9 1.1-2.8-.3-1.6-.9-2.6-1.1zm18.1 22.9c1.2-1 7.9-1 10.8-1.6-2.2 1.4-5.7.8-10.8 1.6zm-3.4 3.4c.7-.3.9-.6.8-1l5.4-.4c-.6 1.2-3.5.6-6.2 1.4zm-99.2 43.1c-8.2 1.4-23.1 1.5-40.7 3 8.2-1.1 28-2 40.7-3zm-38.3-2.8c-10 1.4-12.1.5 0 0zm-30.7 2.1c-8.6 1.2-12 .5 0 0zm145.6-30.3c-.5 1.1-8.1 1-11.6 1.5-4.2 0 10-.8 11.6-1.5zM212.5 61c1.8-.9 9.8-.8 11.6-1.7 2.3.5-10.5 1.7-11.6 1.7zm-5.3 1.1c-.8.1-.8 0-.9-.1-13 2-.3-1.3.9.1zm-78.6 11.8c8.2-2.2 11.7-1.8 0 0zm14.8-2.8c6.1-1.2 18.5-4 23.8-3.6-7.9 1-18.5 2.8-23.8 3.6zm-87.3 9c1.1.1 1.8 0 1.7 0 0 0-.7-.1-1.5-.2s-1.6-.2-2-.3c-.2-.1-.4-.1-.4-.1l-.1.2c-.2.5-.3.8-.5 1.2l-.3.6c-.1.2-.2.4-.3.5-.1.1-.1.2-.2.4l-.1.1-2.1 3.2.1-.2c.3-.4.6-.7.7-.8.2-.2-.3.3-1.4.7-1 .4-2.1.5-2.6.5-.6 0-.7-.1-.7-.1s.2.1.8.1c.5 0 1.3-.1 2.1-.3.7-.2 1.4-.6 1.7-.7.3-.2.2-.2-.1.1-.2.2-.3.4-.5.7v.1l2.1-3.2.1-.1.1-.2.3-.6.4-.8.3-.8h.1c.4-.2 1.3-.1 2.3 0z"></path>
                        </clipPath>
                      </defs>
                      <path clip-path="url(#brush3_svg__a)"
                            d="M-1.3 43.2c20.7 20.2 103.2-22.9 220.4-33C295 3.7 343.5 20.4 343.5 20.4s56.5 22.3-69 28.5c-121.9 6-223.2 35.7-223.2 35.7S26 97.4 289.8 76.2"
                            stroke-width="22" fill="none" stroke="#dc4133"></path>
                    </svg>
                    <span>product</span></strong>*/}
                  {/*Planetary is a digital product studio*/}
                  {/*born in Brooklyn, and based globally.*/}
                  采撷科技是一家技术服务公司，总部位于北京。
                </h1>
                <div className={styles.bottom}>
                  <Link
                    to="/about"
                    onMouseEnter={this.onElementEnter}
                    onMouseLeave={this.onElementLeave}
                  >
                    关于我们
                    {/*About Us*/}
                    <Arrow size="1.5rem" color="red" className={styles.arrow}/>
                  </Link>
                  <h4>滑动浏览更多</h4>
                </div>
              </div>
            </div>
            {projects.map((project, idx) => (
              <div
                key={`project${idx}`}
                className={classnames(styles.project, {
                  [styles.active]: projectActive === idx,
                  [styles.inactive]: projectActive !== null
                  && projectActive !== idx,
                  [styles.exiting]: this.isExiting(),
                })}
                ref={(prj) => {
                  this.projects[idx] = prj
                }}
              >
                <Link
                  to={project.node.fields.slug}
                  onClick={this.checkDragging}
                  className={styles.projectLink}
                  onMouseEnter={
                    !isTouchDevice() ? this.onProjectEnter(idx) : null
                  }
                  onMouseLeave={
                    !isTouchDevice() ? this.onProjectLeave : null
                  }
                  exit={{
                    trigger: ({ exit, node }) => this.exit(exit, node),
                    length: 5,
                    zIndex: 2,
                  }}
                  entry={{
                    length: 5,
                  }}
                >
                  <h3><span>{project.node.frontmatter.subtitle}</span></h3>
                  <h2><span>{project.node.frontmatter.title}</span></h2>
                  <p><span>{project.node.frontmatter.summary}</span></p>
                  <h4><span>View Case Study <Arrow color="red"/></span></h4>
                </Link>
              </div>
            ))}
            <div
              className={classnames(
                styles.project,
                styles.end,
                {
                  [styles.exiting]: this.isExiting(),
                },
              )}
              ref={(end) => {
                this.end = end
              }}
            >
              <div className={styles.wrap}>
                <Link
                  to="/insights"
                  onMouseEnter={this.onElementEnter}
                  onMouseLeave={this.onElementLeave}
                >
                  <span>Insights</span>
                </Link>
                <Link
                  to="/contact"
                  onMouseEnter={this.onElementEnter}
                  onMouseLeave={this.onElementLeave}
                >
                  <span>Contact Us</span>
                </Link>
              </div>
            </div>
          </Scrollbar>
        </div>
        <div
          className={classnames(styles.background, this.isExiting() && styles.exiting)}
          style={{
            background:
              backgroundColor || (
                projectActive !== null
                && projects[projectActive].node.frontmatter.primaryColor
              ),
            opacity: backgroundColor !== null || projectActive !== null ? 1 : 0,
          }}
        >
          <Transition
            width={windowWidth || 0}
            height={windowHeight || 0}
            ref={this.transition}
            displacementImage={withPrefix("assets/clouds.jpg")}
          />
        </div>
      </Layout>
    )
  }
}

export default withWindowSizeListener(Index)

export const pageQuery = graphql`
    query WorkQuery {
        projects: allMarkdownRemark(
            sort: { order: ASC, fields: [frontmatter___sort] },
            filter: { frontmatter: { templateKey: { eq: "project" } }}
        ){
            edges {
                node {
                    fields {
                        slug
                    }
                    frontmatter {
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
`
