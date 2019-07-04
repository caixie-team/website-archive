import React from "react"
import PropTypes from "prop-types"
import TransitionLink from "gatsby-plugin-transition-link"

const Link = ({ children, ...props }) => {
  const linkProps = {
    entry: {
      length: 1,
      delay: 1,
    },
    exit: {
      length: 1,
    },
    ...props,
  }
  return (<TransitionLink {...linkProps}>{children}</TransitionLink>)
}

Link.propTypes = {
  children: PropTypes.any.isRequired,
}

export default Link
