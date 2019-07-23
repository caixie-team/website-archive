import React, { Component } from "react"
import PropTypes from "prop-types"
import classnames from "classnames"
import anime from "animejs"
import { withWindowSizeListener } from "react-window-size-listener"

import Link from "../Link"
import { lteSmallViewport } from "../../lib/media-query"
import { customMedia, customProperties } from "styles/variables.module.css"
// import { customMedia, customProperties } from "styles/global.css"
import styles from './styles.module.css';

class Nav extends Component {
  static propTypes = {
    light: PropTypes.bool,
    windowSize: PropTypes.shape({
      windowWidth: PropTypes.number,
      windowHeight: PropTypes.number,
    }),
  }

  static defaultProps = {
    light: false,
    windowSize: {
      windowWidth: null,
      windowHeight: null,
    },
  }

  state = {
    mobileOpen: false,
    wrapClasses: {},
  }

  navItemRefs = []

  static getDerivedStateFromProps(props, state) {
    if (!lteSmallViewport() && state.mobileOpen) {
      return {
        mobileOpen: false,
        wrapClasses: {},
      }
    }

    return null
  }

  componentDidMount() {
    this.smallViewport = parseInt(customProperties["--small-viewport"], 10)
    if (lteSmallViewport()) {
      this.navItemRefs.forEach((item) => {
        if (!item) {
          return
        }

        item.style = "transform: translateX(100px);" // eslint-disable-line no-param-reassign
      })
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // 获取参数中的窗口宽度
    const { windowSize: { windowWidth } } = this.props
    // 如果上次传递参数中未包含窗口宽度，说明是初次访问，不必更新
    if (prevProps.windowSize.windowWidth === null) {
      return
    }
    // 如果上次窗口宽度小于小视窗 900px, 隐藏导航收进菜单按钮中
    if (prevProps.windowSize.windowWidth <= this.smallViewport
      && windowWidth > this.smallViewport) {
      this.wrap.style.backgroundColor = ""

      this.navItemRefs.forEach((item) => {
        if (!item) {
          return
        }

        item.style = "" // eslint-disable-line no param-reassign
      })
    } else if (
      // 如果上次窗口宽度大于视窗 900px, 隐藏导航收进菜单按钮中
      prevProps.windowSize.windowWidth > this.smallViewport
      && windowWidth <= this.smallViewport) {
      this.navItemRefs.forEach((item) => {
        if (!item) {
          return
        }
        item.style = "transform: translateX(100px);" // eslint-disable-line no-param-reassign
      })
    }
  }

  componentWillUnmount() {
    this.unmounting = true
  }

  toggleMenu = () => {
    if (!lteSmallViewport()) {
      return
    }

    const { mobileOpen } = this.state
    this.setState({ mobileOpen: !mobileOpen }, this.animate)
  }

  animate = () => {
    const { mobileOpen } = this.state
    if (this.timeline) {
      this.timeline.pause()
    }

    this.timeline = anime.timeline()

    if (mobileOpen) {
      document.body.classList.add("no-scroll")
      this.setState({ wrapClasses: styles.open })

      this.timeline.add({
        duration: 200,
        easing: "easeInOutQuad",
        targets: this.wrap,
        backgroundColor: "rgba(50, 55, 61, 1)",
      })

      this.navItemRefs.forEach((item, index) => {
        this.timeline.add({
          targets: item,
          translateX: {
            value: 0,
            easing: "spring(1, 100, 30, 20)",
          },
          opacity: {
            value: 1,
            duration: 100,
            easing: "easeInOutQuad",
          },
        }, 25 + (50 * index))
      })
    } else {
      this.navItemRefs.forEach((item, index) => {
        this.timeline.add({
          targets: item,
          translateX: {
            value: 100,
            easing: "spring(1, 100, 30, 20)",
          },
          opacity: {
            value: 0,
            duration: 100,
            easing: "easeInOutQuad",
          },
          complete: () => {
            if (!this.unmounting) {
              this.setState({ wrapClasses: {} })
            }

            document.body.classList.remove("no-scroll")
          },
        }, 50 + (50 * index))
      })

      // 菜单背景切换时的 timeline
      this.timeline.add({
        duration: 200,
        easing: "easeInOutQuad",
        targets: this.wrap,
        backgroundColor: "rgba(50, 55, 61, 0)",
      }, (50 + ((50 * this.navItemRefs.length) / 2)))
    }
  }

  render() {
    const { light } = this.props
    const { mobileOpen, wrapClasses } = this.state
    const navItems = [
      {
        to: "/",
        label: "工作",
      },
      // {
      //   to: "/approach",
      //   label: "方法策略",
      // },
      {
        to: "/about",
        label: "关于",
      },
      // {
      //   to: "/insights",
      //   label: "观点",
      // },
      {
        to: "/contact",
        label: "与我们一起工作",
        className: styles.contact,
      },
    ]

    this.navItemRefs = []

    return (
      <nav className={styles.container}>
        <div
          className={classnames(styles.wrap, wrapClasses)}
          ref={(el) => {
            this.wrap = el
          }}>
          <Link
            to="/"
            title="采撷科技"
            className={classnames(styles.logo, {
              [styles.light]: light,
            })}>
            Logo
          </Link>
          <div
            className={styles.mobileToggle}
            onClick={this.toggleMenu}
            role="button"
            tabIndex="-1"
            onKeyPress={(evt) => {
              if (evt.keyCode === 13 || evt.keyCode === 32) {
                this.toggleMenu()
              }
            }}
          >
            {mobileOpen ? "关闭" : "菜单"}
          </div>
          <ul
            className={styles.navItems}
            ref={(el) => {
              this.navItems = el
            }}
          >
            {navItems.map((item, idx) => (
              <li
                className={classnames(styles.navItem, item.className)}
                key={`navItem${idx}`}
                ref={(el) => {
                  this.navItemRefs.push(el)
                }}
              >
                <Link
                  to={item.to}
                  className={styles.navLink}
                  activeClassName={styles.active}
                  onClick={this.toggleMenu}
                >
                  <span className={styles.navEffect} data-hover={item.label}>
                    <em>{item.label}</em>
                  </span>
                </Link>
                {!item.className && <span className={styles.navLinkBg}/>}
              </li>
            ))}
          </ul>
        </div>
      </nav>
    )
  }
}

export default withWindowSizeListener(Nav)
