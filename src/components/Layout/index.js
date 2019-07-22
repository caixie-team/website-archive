/* global document window */
/* eslint:disabled no-unused-vars */
import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import anime from 'animejs';
import smoothscroll from 'smoothscroll-polyfill';
import Nav from 'components/Nav';

import {lteSmallViewport} from 'lib/media-query';

// import Nav from 'components/Nav';
import Footer from 'components/Footer';

import 'styles/global.css';

import styles from './styles.module.css';

const handleWindow = () => {
  const body = document.querySelector('body');

  if (!lteSmallViewport() && window.innerWidth > body.clientWidth + 5) {
    body.classList.add('hasScrollbar');
    body.setAttribute('style', `--scroll-bar: ${window.innerWidth - body.clientWidth}px`);
  } else {
    body.classList.remove('hasScrollbar');
    body.setAttribute('style', '--scroll-bar: 0px');
  }
};

class Layout extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    light: PropTypes.bool,
    hideFooter: PropTypes.bool,
    contentBefore: PropTypes.node,
    contentAfter: PropTypes.node,
    outerClassName: PropTypes.string,
    transitionStatus: PropTypes.string,
  };

  static defaultProps = {
    light: false,
    hideFooter: false,
    contentBefore: null,
    contentAfter: null,
    outerClassName: null,
    transitionStatus: null,
  };

  constructor(props) {
    super(props);

    this.content = React.createRef();
  }

  componentDidMount() {
    smoothscroll.polyfill();
    handleWindow();
  }

  componentDidUpdate(prevProps) {
    const {transitionStatus} = this.props;
    if (prevProps.transitionStatus !== transitionStatus) {
      if (transitionStatus === 'entering') {
        anime({
          targets: this.content.current,
          opacity: [0, 1],
          duration: 1000,
          easing: 'easeInOutQuad',
        });
      } else if (transitionStatus === 'exiting') {
        anime({
          targets: this.content.current,
          opacity: [1, 0],
          duration: 1000,
          easing: 'easeInOutQuad',
        });
      }
    }
  }

  render() {
    const {
      children, hideFooter, light, contentBefore, contentAfter, outerClassName,
    } = this.props;

    return (
      <Fragment>
        {contentBefore}
        <div className={classnames(styles.outer, outerClassName)}>
          <div className={styles.container} name="top">
            <Nav light={light} />
            <div ref={this.content}>
              {children}
              {!hideFooter && <Footer />}
            </div>
          </div>
        </div>
        {contentAfter}
      </Fragment>
    );
  }
}

export default Layout;
