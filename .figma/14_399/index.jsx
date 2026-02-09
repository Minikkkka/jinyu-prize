import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.thumbnails}>
      <div className={styles.group}>
        <div className={styles.ellipse} />
        <div className={styles.ellipse2} />
        <div className={styles.ellipse3} />
        <div className={styles.ellipse4} />
        <img src="../image/mlak134c-kwlpu2d.svg" className={styles.bgPage} />
      </div>
      <img src="../image/mlak134c-lo8lnce.svg" className={styles.bgPage2} />
      <div className={styles.frame9054}>
        <div className={styles.a4} />
        <div className={styles.a5} />
        <div className={styles.a1} />
        <div className={styles.a6} />
        <div className={styles.a2} />
      </div>
      <div className={styles.frame9051}>
        <img src="../image/mlak134c-pe8clyx.svg" className={styles.capa1} />
        <p className={styles.a32Screens}>32+ Screens</p>
      </div>
    </div>
  );
}

export default Component;
