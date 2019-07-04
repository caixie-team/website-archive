import React from "react"
import PropTypes from "prop-types"
import classnames from "classnames"

import styles from "./styles.module.css"

const Stats = ({
                 className,
                 stat1Value,
                 stat1LableHtml,
                 stat2Value,
                 stat2LabelHtml,
                 stat3Value,
                 stat3LabelHtml,
               }) => (
  <section className={classnames(className, styles.container)}>
    <div className={styles.column}/>
    <div className={styles.stats}>
      <div className={styles.stat}>
        <h3>{stat1Value}</h3>
        <div dangerouslySetInnerHTML={{ __html: stat1LableHtml }}/>
      </div>
      <div className={styles.stat}>
        <h3>{stat2Value}</h3>
        <div dangerouslySetInnerHTML={{ __html: stat2LabelHtml }}/>
      </div>
      <div className={styles.stat}>
        <h3>{stat3Value}</h3>
        <div dangerouslySetInnerHTML={{ __html: stat3LabelHtml }}></div>
      </div>
    </div>
  </section>
)

Stats.propTypes = {
  className: PropTypes.string,
  stat1Value: PropTypes.string.isRequired,
  stat1LabelHtml: PropTypes.string.isRequired,
  stat2Value: PropTypes.string.isRequired,
  stat2LabelHtml: PropTypes.string.isRequired,
  stat3Value: PropTypes.string.isRequired,
  stat3LabelHtml: PropTypes.string.isRequired,
}

Stats.defaultProps = {
  className: "",
}

export default Stats
