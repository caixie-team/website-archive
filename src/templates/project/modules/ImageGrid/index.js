import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import Img from 'gatsby-image';
import classnames from 'classnames';
import {withPrefix} from 'gatsby';

import styles from './styles.module.css';

const processFile = (file) => {
  if (file.extension === 'mp4') {
    return (
      <video width="100%" autoPlay loop muted playsInline>
        <source src={withPrefix(`assets/${file.relativePath}`)} type="video/mp4" />
      </video>
    );
  }

  return (
    <img
      src={withPrefix(`assets/${file.relativePath}`)}
      alt=""
      className={styles.imageTag}
    />
  );
};

const ImageGrid = ({
                     className,
                     images,
                     columns,
                     backgroundColor,
                     staggered,
                     staggeredCopyHtml,
                     staggeredStart,
                     frameColor,
                   }) => {
  let imageElements;

  if (staggered) {
    let leftFilter = (img, idx) => ((idx + 1) % 2);
    let rightFilter = (img, idx) => (idx % 2);

    if (staggeredStart === 'right') {
      const tempFilter = leftFilter;
      leftFilter = rightFilter;
      rightFilter = tempFilter;
    }

    const copy = (
      <div
        className={styles.copy}
        dangerouslySetInnerHTML={{__html: staggeredCopyHtml}}
      />
    );

    imageElements = (
      <Fragment>
        <div className={styles.column}>
          {staggeredStart === 'right' && copy}
          {images.filter(leftFilter).map((image, idx) => (
            <div
              className={classnames(
                styles.imgWrapStaggered,
                idx === 0 && styles.leftFirst,
              )}
              key={`staggerLeft${idx}`}
            >
              <div className={styles.img} style={{background: frameColor}}>
                <Img fluid={image} />
              </div>
            </div>
          ))}
        </div>
        <div className={classnames(styles.column, styles.right)}>
          {staggeredStart === 'left' && copy}
          {images.filter(rightFilter).map((image, idx) => (
            <div
              className={classnames(
                styles.imgWrapStaggered,
                idx === 0 && styles.rightFirst,
              )}
              key={`staggerRight${idx}`}
            >
              <div className={styles.img} style={{background: frameColor}}>
                {typeof image === 'string'
                  ? <img src={image} alt="" />
                  : <Img fluid={image} />
                }
              </div>
            </div>
          ))}
        </div>
      </Fragment>
    );
  } else {
    imageElements = images.map((image, idx) => (
      <div
        className={styles.imgWrap}
        style={{
          gridColumn: (
            idx === 0
            && columns > 1
            && (
              (columns % 2 === 1 && images.length % 2 === 0)
              || (columns % 2 === 0 && images.length % 2 === 1)
            )
          ) && 'span 2',
        }}
        key={`image${idx}`}
      >
        <div className={styles.img}>
          {image.relativePath
            ? processFile(image)
            : (
              <Img
                fluid={image}
                style={{
                  maxWidth: image.presentationWidth,
                  margin: '0 auto',
                }}
              />
            )
          }
        </div>
      </div>
    ));
  }

  return (
    <section
      className={classnames(
        className,
        styles.container,
        {
          [styles.singleCol]: columns === 1,
          [styles.fullWidth]: backgroundColor,
          fullWidth: backgroundColor,
          [styles.staggered]: staggered,
          [styles.startLeft]: staggered && staggeredStart === 'left',
          [styles.startRight]: staggered && staggeredStart === 'right',
        },
      )}
      style={{
        gridTemplateColumns: backgroundColor ? '1fr' : `repeat(${columns}, 1fr)`,
        background: backgroundColor,
      }}
    >
      {backgroundColor
        ? (
          <div
            className={classnames(styles.container, styles.wrap)}
            style={{
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
            }}
          >
            {imageElements}
          </div>
        )
        : imageElements
      }
    </section>
  );
};

ImageGrid.propTypes = {
  className: PropTypes.string,
  images: PropTypes.array.isRequired,
  columns: PropTypes.number,
  backgroundColor: PropTypes.string,
  staggered: PropTypes.bool,
  staggeredCopyHtml: PropTypes.string,
  staggeredStart: PropTypes.string,
  frameColor: PropTypes.string,
};

ImageGrid.defaultProps = {
  className: '',
  columns: null,
  backgroundColor: '',
  staggered: false,
  staggeredCopyHtml: '',
  staggeredStart: 'right',
  frameColor: null,
};

export default ImageGrid;
