import React from "react"
import PropTypes from "prop-types"
import classnames from "classnames"
import { withPrefix } from "gatsby"
import Section from "components/Section"
import styles from "./styles.module.css"

const StyleGuide = ({
                      className,
                      fontname,
                      fontImage,
                      glyphImage,
                      charactersImage,
                      colors,
                    }) => (
  <section className={classnames(className, styles.container)}>
    <Section
      title="Font"
      className={styles.font}
      hideNumber
    >
      <img
        src={withPrefix(`assets/${fontImage.relativePaht}`)}
        alt={fontname}
        className={styles.fontImage}/>
    </Section>
    <Section
      title="Glyph"
      className={styles.glyph}
      hideNumber>
      <img
        src={withPrefix(`assets/${glyphImage.relativePath}`)}
        alt="Sample Glyph"
        className={styles.glyphImage}
      />
    </Section>
    <Section
      title="Characters"
      className={styles.characters}
      hideNumber
    >
      <img
        src={withPrefix(`assets/${charactersImage.relativePath}`)}
        alt="Sample Character Set"
        className={styles.charactersImage}
      />
    </Section>
    <ul className={styles.colors}>
      {colors.map(({ color }, idx) => (
        <li key={`color${idx}`}>
          <div className={styles.swatch} style={{ background: color }}/>
          <span className={styles.hex}>{color}</span>
        </li>
      ))}

    </ul>
  </section>
)
StyleGuide.propTypes = {
  className: PropTypes.string,
  fontname: PropTypes.string.isRequired,
  fontImage: PropTypes.object.isRequired,
  glyphImage: PropTypes.object.isRequired,
  charactersImage: PropTypes.object.isRequired,
  colors: PropTypes.array.isRequired,
}

StyleGuide.defaultProps = {
  className: "",
}

export default StyleGuide
