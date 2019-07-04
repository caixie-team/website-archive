import React from 'react';
import PropTypes from 'prop-types';
import Img from 'gatsby-image';

import Link from 'components/Link';

import styles from './styles.module.css';

const Insight = ({
                   slug, title, author, date, excerpt, primaryColor, hero, thumb,
                 }) => {
  const image = thumb || hero;

  return (
    <Link
      className={styles.insight}
      to={slug}
    >
      {image
        ? (
          <div className={styles.imageWrap} style={{backgroundColor: primaryColor}}>
            <Img
              fluid={image.childImageSharp.fluid}
              backgroundColor={primaryColor}
              className={styles.image}
            />
          </div>
        )
        : (<div className={styles.colorFrame} style={{backgroundColor: primaryColor}} />)
      }
      <h2 className={styles.title}>{title}</h2>
      <p>{excerpt}</p>
      <div className={styles.author}>By {author} - {date}</div>
    </Link>
  );
};

Insight.propTypes = {
  slug: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  author: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  excerpt: PropTypes.string,
  primaryColor: PropTypes.string.isRequired,
  hero: PropTypes.object,
  thumb: PropTypes.object,
};

Insight.defaultProps = {
  excerpt: '',
  hero: null,
  thumb: null,
};

export default Insight;
