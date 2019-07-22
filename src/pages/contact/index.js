/* global window fetch encodeURIComponent */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {OutboundLink} from 'gatsby-plugin-google-analytics';
import Textarea from 'react-textarea-autosize';

import Layout from 'components/Layout';
// import SEO from 'components/SEO';
import Arrow from 'components/Arrow';

import styles from './styles.module.css';

class Contact extends Component {
  static propTypes = {
    transitionStatus: PropTypes.string.isRequired,
  }

  state = {
    name: '',
    email: '',
    message: '',
    sending: false,
    sent: false,
    error: false,
  };

  componentDidMount() {
    if (window.location.search.match('sent=1')) {
      this.setState({sent: true});
    }
  }

  onFieldChange = (evt) => {
    this.setState({
      [evt.target.name]: evt.target.value,
    });
  }

  handleSubmit = (evt) => {
    const {name, email, message} = this.state;
    const bodyObject = {
      'form-name': 'contact',
      name,
      email,
      message,
    };
    const body = Object.keys(bodyObject)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(bodyObject[key])}`)
      .join('&');

    this.setState({
      sending: true, name: '', email: '', message: '',
    });

    fetch('/', {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body,
    })
      .then(() => {
        this.setState({sending: false, sent: true});
      })
      .catch(() => {
        this.setState({error: true});
      });

    evt.preventDefault();
  };

  hasMissingFields = () => {
    const {name, email, message} = this.state;

    if (!name || !email || !message) {
      return true;
    }

    return false;
  }

  render() {
    const {transitionStatus} = this.props;
    const {
      name, email, message, sending, sent, error,
    } = this.state;

    return (
      <Layout transitionStatus={transitionStatus}>
        {/*<SEO title="Work With Us" />*/}

        <div className={styles.container}>
          <div>
            <h1><span>欢迎你的到来!</span><br />朋友你好.</h1>

            <div className={styles.info}>
              <div className={styles.contact}>
                <div className={styles.column}>
                  <div className={styles.block}>
                    <h3>联系方式</h3>
                    <div>E: <OutboundLink href="mailto:team@planetary.co">team@caixie.top</OutboundLink></div>
                    <div>P: <a href="tel:13488689885">13488689885</a></div>
                  </div>
                </div>
                <div className={styles.column}>
                  <div className={styles.block}>
                    <h3>社交网络</h3>
                    <div><OutboundLink href="https://twitter.com/plntary">WeChat</OutboundLink></div>
                    <div><OutboundLink href="https://twitter.com/plntary">Twitter</OutboundLink></div>
                    <div><OutboundLink href="https://instagram.com/planetarycorp">Instagram</OutboundLink></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h2>给我们讲讲你的项目</h2>
            <form
              name="contact"
              method="POST"
              action="/contact?sent=1"
              className={styles.form}
              data-netlify="true"
              onSubmit={this.handleSubmit}
            >
              {sent && (
                <div className={styles.sent}>
                  Awesome! Someone from our team will get in touch
                  with you very soon.
                </div>
              )}
              {error && (
                <div className={styles.error}>
                  Oh no! We had trouble sending your message. Please send us an
                  email directly to{' '}
                  <OutboundLink href="mailto:team@planetary.co">team@planetary.co</OutboundLink>.
                </div>
              )}
              <label htmlFor="name">
                <input
                  name="name"
                  id="name"
                  value={name}
                  onChange={this.onFieldChange}
                  className={classnames({
                    [styles.hasValue]: name,
                  })}
                />
                <span>您的名字</span>
              </label>
              <label htmlFor="email">
                <input
                  name="email"
                  id="email"
                  value={email}
                  onChange={this.onFieldChange}
                  className={classnames({
                    [styles.hasValue]: email,
                  })}
                />
                <span>您的电子邮箱</span>
              </label>
              {/* eslint-disable jsx-a11y/label-has-associated-control */}
              {/* eslint-disable jsx-a11y/label-has-for */}
              <label htmlFor="message">
                <Textarea
                  name="message"
                  id="message"
                  onChange={this.onFieldChange}
                  className={classnames({
                    [styles.hasValue]: message,
                  })}
                  value={message}
                />
                <span>给我们讲讲这项工作</span>
              </label>
              {/* eslint-enable jsx-a11y/label-has-associated-control */}
              {/* eslint-enable jsx-a11y/label-has-for */}
              <button
                type="submit"
                className={styles.submit}
                disabled={sending || this.hasMissingFields()}
              >
                {sending
                  ? 'Sending…'
                  : (
                    <>
                      发送消息{' '}
                      <Arrow
                        color="red"
                        size="0.8rem"
                        lineWeight={6}
                        className={classnames(
                          styles.arrow,
                          {[styles.show]: !this.hasMissingFields()},
                        )}
                      />
                    </>
                  )
                }
              </button>
              <input type="hidden" name="form-name" value="contact" />
            </form>
          </div>
        </div>
      </Layout>
    );
  }
}

export default Contact;
