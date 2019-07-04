import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import styles from './styles.module.css';

const Arrow = ({
                 size, color, direction, className, lineWeight,
               }) => (
  <span
    className={classnames(styles.arrow, styles[color] || color, styles[direction], className)}
    style={{lineHeight: size}}
  >
        <svg viewBox="0 0 81 81" width={size} style={{width: size}} version="1.1" xmlns="http://www.w3.org/2000/svg">
            <g stroke="none" strokeWidth={lineWeight} fill="none" fillRule="nonzero" strokeLinecap="square">
                <polyline
                  fillRule="nonzero"
                  transform="translate(40.000000, 40.597980) rotate(45.000000) translate(-40.000000, -40.597980)"
                  points="68 68.5979797 68 12.5979797 12 12.5979797"
                />
                <path d="M79,40.5 L1,40.5" />
            </g>
        </svg>
    </span>
);

Arrow.propTypes = {
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  color: PropTypes.string.isRequired,
  className: PropTypes.string,
  direction: PropTypes.oneOf(['up', 'right', 'down', 'left']),
  lineWeight: PropTypes.number,
};

Arrow.defaultProps = {
  size: '1rem',
  className: null,
  direction: 'right',
  lineWeight: 4,
};

export default Arrow;
