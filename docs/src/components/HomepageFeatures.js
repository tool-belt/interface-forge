import React from 'react';
import clsx from 'clsx';
import styles from './HomepageFeatures.module.css';

const FeatureList = [
    {
        title: 'What you\'d expect',
        Svg: require('../../static/img/undraw_docusaurus_mountain.svg').default,
        description: (
            <>
                A dictum euismod molestie placerat ut consequat vestibulum hac ad
                cum consectetur quam suspendisse vivamus mauris eros feugiat
                scelerisque.
            </>
        ),
    },
    {
        title: 'And then some',
        Svg: require('../../static/img/undraw_docusaurus_tree.svg').default,
        description: (
            <>
                A suspendisse accumsan adipiscing tristique habitasse consequat
                porta condimentum conubia sodales in a porta ut elementum convallis
                a turpis nostra nulla consectetur suspendisse.
            </>
        ),
    },
    {
        title: 'Powered by TypeScript',
        Svg: require('../../static/img/undraw_docusaurus_react.svg').default,
        description: (
            <>
                Sodales duis ad nostra augue lectus ultrices sed velit nibh a et
                metus quam magnis pretium et metus a cras potenti adipiscing arcu a
                pulvinar habitant mauris vestibulum adipiscing.
            </>
        ),
    },
];

function Feature({ Svg, title, description }) {
    return (
        <div className={clsx('col col--4')}>
            <div className="text--center">
                <Svg className={styles.featureSvg} alt={title} />
            </div>
            <div className="text--center padding-horiz--md">
                <h3>{title}</h3>
                <p>{description}</p>
            </div>
        </div>
    );
}

export default function HomepageFeatures() {
    return (
        <section className={styles.features}>
            <div className="container">
                <div className="row">
                    {FeatureList.map((props, idx) => (
                        <Feature key={idx} {...props} />
                    ))}
                </div>
            </div>
        </section>
    );
}
