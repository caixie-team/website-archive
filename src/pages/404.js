import React from 'react';
import {Link} from 'gatsby';

import Layout from 'components/Layout';
// import SEO from 'components/SEO';
// import Brush from 'components/Brush';
import Arrow from 'components/Arrow';

import styles from '../styles/404.module.css';

const NotFoundPage = () => (
  <Layout>
    {/*<SEO title="Page not found" />*/}
    <div className={styles.container}>
      <div className={styles.fof}>404</div>
      <h1>Looks like<br />you&rsquo;re lost.</h1>
      <Link to="/">Back to Home <Arrow color="red" size="1.25rem" /></Link>
    </div>
  </Layout>
);

export default NotFoundPage;
