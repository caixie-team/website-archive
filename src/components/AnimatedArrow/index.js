import React, {Component} from 'react';
import PropTypes from 'prop-types';
import anime from 'animejs';

class AnimatedArrow extends Component {
  static ARROW = 'arrow';

  static PLUS = 'plus';

  static propTypes = {
    state: PropTypes.oneOf([AnimatedArrow.ARROW, AnimatedArrow.PLUS]),
    duration: PropTypes.number,
    delay: PropTypes.number,
    color: PropTypes.string,
    size: PropTypes.number,
    className: PropTypes.string,
  };

  static defaultProps = {
    state: AnimatedArrow.ARROW,
    duration: 200,
    delay: 0,
    color: '#fff',
    size: 81,
    className: '',
  };

  componentDidUpdate(prevProps) {
    const {state, duration, delay} = this.props;

    if (prevProps.state !== state) {
      const tl = anime.timeline({
        easing: 'easeOutExpo',
        duration,
        delay,
      });
      if (state === AnimatedArrow.ARROW) {
        tl.add({
          targets: this.group,
          rotate: [90, 0],
        }, duration / 4);
        tl.add({
          targets: this.path,
          d: [
            {value: 'M68 68 40.5 40.5 L12 12'}, // |
            {value: 'M68 68 68 12.5 L12 12'}, // >
          ],
        }, 0);
      } else if (state === AnimatedArrow.PLUS) {
        tl.add({
          targets: this.group,
          rotate: [0, 90],
        }, duration / 4);
        tl.add({
          targets: this.path,
          d: [
            {value: 'M68 68 68 12.5 L12 12'}, // >
            {value: 'M68 68 40.5 40.5 L12 12'}, // |
          ],
        }, 0);
      }
    }
  }

  render() {
    const {color, className, size} = this.props;

    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 81 81"
        width={size}
        className={className}
      >
        <g
          style={{stroke: color, transformOrigin: 'center'}}
          strokeWidth={2}
          fill="none"
          ref={(group) => {
            this.group = group;
          }}
        >
          <path
            d="M68 68 68 12.5 L12 12"
            transform="rotate(45 40 40.598)"
            ref={(path) => {
              this.path = path;
            }}
          />
          <path d="M79 40.5H1" />
        </g>
      </svg>
    );
  }
}

export default AnimatedArrow;
