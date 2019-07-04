import React from "react"
import PropTypes from "prop-types"
import Img from "gatsby-image"
import classnames from "classnames"

import styles from "./styles.module.css"

const Image = ({
                 className,
                 image,
                 alt,
               }) => (
  <section
    className={classnames(className, styles.container, "fullWidth")}>
    <Img fluid={image} alt={alt} className={styles.img}/>
  </section>
)

Image.propTypes = {
  className: PropTypes.string,
  image: PropTypes.object.isRequired,
  alt: PropTypes.string,
}

Image.defaultProps = {
  className: "",
  alt: "",
}
export default Image
