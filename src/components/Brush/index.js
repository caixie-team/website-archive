import React from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import VisibilitySensor from 'react-visibility-sensor';

import styles from './styles.module.css';

import {ReactComponent as Brush1} from '../../images/brush1.svg';
import {ReactComponent as Brush2} from '../../images/brush2.svg';
import {ReactComponent as Brush3} from '../../images/brush3.svg';
import {ReactComponent as Brush4} from '../../images/brush4.svg';
import {ReactComponent as Brush5} from '../../images/brush5.svg';

const brushes = {
  1: Brush1,
  2: Brush2,
  3: Brush3,
  4: Brush4,
  5: Brush5,
};

const Brush = ({number, children}) => (
  <VisibilitySensor>
    {({isVisible}) => (
      <strong
        className={classnames(styles.brush, styles[`brush${number}`], {
          [styles.animate]: isVisible,
          [styles.hide]: !isVisible,
        })}
      >
        {React.createElement(brushes[number])}
        <span>{children}</span>
      </strong>
    )}
  </VisibilitySensor>
);

Brush.propTypes = {
  number: PropTypes.number,
  children: PropTypes.node.isRequired,
};

Brush.defaultProps = {
  number: 1,
};

export default Brush;
