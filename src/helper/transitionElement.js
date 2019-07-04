import React, { Component } from 'react';
import { TransitionState } from 'gatsby-plugin-transition-link';

// import './transitionElement.scss';

class TransitionElement extends Component {
  render() {
    return (
      <TransitionState>
        {({ transitionStatus }) => {
          return (
            <div
              className={
                'transition transition' +
                (['entering', 'entered'].includes(
                  transitionStatus
                )
                  ? '--exiting'
                  : '--entering')
              }
            />
          );
        }}
      </TransitionState>
    );
  }
}

export default TransitionElement;
