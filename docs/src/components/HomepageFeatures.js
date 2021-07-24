import React from 'react';
import clsx from 'clsx';
import styles from './HomepageFeatures.module.css';

const FeatureList = [
    {
        title: 'What you\'d expect',
        Svg: require('../../static/img/bg-shape-1.svg').default,
        description: (
            <>
                interfaceForge brings you highly extensible factories with
                support for defaults, overrides, iterators, as well as for batches
                and static fixtures.
            </>
        ),
    },
    {
        title: 'And then some',
        Svg: require('../../static/img/bg-shape-2.svg').default,
        description: (
            <>
                Allows function-based factories, ships with generators and performs
                well if you need to generate complex data for databases.
            </>
        ),
    },
    {
        title: 'Powered by TypeScript',
        Svg: require('../../static/img/bg-shape-3.svg').default,
        description: (
            <>
                Open-source-driven, carefully typed, low-dependency source code.
                Made real by and optimised for jest unit testing.
            </>
        ),
    },
];

function Feature({ Svg, title, description }) {
    return (
        <div className={clsx('col col--4')}>
            <Svg className={styles.featureSvg} alt={title} />
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
