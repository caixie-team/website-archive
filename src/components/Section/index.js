import React from "react"
import PropTypes from "prop-types"
import classnames from "classnames"

import styles from "./styles.module.css"

const Section = ({
                   title,
                   className,
                   contentClassName,
                   children,
                   innerRef,
                   hideHeader,
                   hideNumber,
                 }) => (
  <section
    ref={innerRef}
    id={title.replace(/[^a-z0-9]+/ig).toLowerCase()}
    className={classnames(styles.section, className)}
  >
    <header className={classnames({ [styles.hide]: hideHeader })}>
      <h2 className={styles.title}>{title}</h2>
      {!hideNumber && <span className={styles.index}/>}
    </header>
    <div className={classnames(styles.content, contentClassName)}>
      {children}
    </div>
  </section>
)

Section.propTypes = {
  title: PropTypes.string.isRequired,
  className: PropTypes.string,
  innerRef: PropTypes.func,
  contentClassName: PropTypes.string,
  children: PropTypes.node.isRequired,
  hideHeader: PropTypes.bool,
  hideNumber: PropTypes.bool,
}

Section.defaultProps = {
  className: null,
  contentClassName: null,
  hideHeader: false,
  hideNumber: false,
  innerRef: () => false,
}

export default Section
