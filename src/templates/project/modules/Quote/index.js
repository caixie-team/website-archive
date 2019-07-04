import styles from "./styles.module.css"
import PropTypes from "prop-types"
import Img from "gatsby-image"

const Quote = ({
                 body,
                 author,
                 authorImage,
                 authorTitle,
                 primaryColor,
               }) => (
  <section
    className={styles.container}
    style={{ color: primaryColor }}
  >
    <blockquote dangerouslySetInnerHTML={{ __html: body }}/>
    {/*<cite> 标签定义作品（比如书籍、歌曲、电影、电视节目、绘画、雕塑等等）的标题。
注释：人名不属于作品的标题*/}
    <cite>
      {authorImage && <Img fluid={authorImage} alt={author} className={styles.img}/>}
      <div
        className={styles.author}>
        <span>{author}</span>
        <em>{authorTitle}</em>
      </div>
    </cite>
  </section>
)

Quote.propTypes = {
  body: PropTypes.string.isRequired,
  authorImage: PropTypes.object,
  author: PropTypes.string.isRequired,
  authorTtile: PropTypes.string.isRequired,
  primaryColor: PropTypes.string.isRequired,
}

Quote.defaultProps = {
  authorImage: null,
}

export default Quote
