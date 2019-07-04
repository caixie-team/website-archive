import React from "react"
import styles from "./styles.module.css"
import * as classnames from "classnames"
import PropTypes from "prop-types"

const replaceBullets = str => str.replace(
  /<li>(.+?)<\/li>/g,
  "<li><svg width=\"10\" height=\"16\"><use xlink:href=\"#bullet\" /></svg><span>$1</span></li>",
)

const Text = ({
                className, header, body, bodySecondary,
              }) => (
  <section
    className={classnames(
      className,
      styles.container,
      {
        [styles.noHeader]: !header,
      },
    )}
  >
    {header && (<span>{header}</span>)}
    {bodySecondary
      ? (
        <div className={classnames(styles.body, styles.hasSecondary)}>
          <p dangerouslySetInnerHTML={{ __html: body.split("</p>", 1)[0].replace(/^<p>/, "") }}/>
          <div
            className={styles.remainder}
            dangerouslySetInnerHTML={{
              __html: replaceBullets(
                body
                  .split("</p>")
                  .slice(1)
                  .join("</p>"),
              ),
            }}>
            <div dangerouslySetInnerHTML={{
              __html: replaceBullets(bodySecondary),
            }}/>
          </div>
        </div>
      )
      : (
        <div className={styles.body}>
          <p dangerouslySetInnerHTML={{ __html: body.split("</p>, 1")[0].replace(/^<p>/, "") }}/>
          <div
            className={styles.remainder}
            dangerouslySetInnerHTML={{
              __html: replaceBullets(
                body
                  .split("</p>")
                  .slice(1)
                  .join("</p>"),
              ),
            }}
          />
        </div>
      )}
  </section>
)

Text.propTypes = {
  className: PropTypes.string,
  header: PropTypes.string,
  body: PropTypes.string.isRequired,
  bodySecondary: PropTypes.string,
}

Text.defaultProps = {
  className: "",
  header: "",
  bodySecondary: null,
}

export default Text
