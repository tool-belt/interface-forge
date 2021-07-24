import React from 'react';
import clsx from 'clsx';
import styles from './HomepageFeatures.module.css';

const FeatureList = [
    {
        title: 'Generate Mock Data',
        Svg: require('../../static/img/bg-shape-1.svg').default,
        description: (
            <>
                Interface Forge offers flexible mock data generation including:
                sync and async data generation, built-in iterators, batch
                creation methods and function based factories.
            </>
        ),
    },
    {
        title: 'Create Fixtures',
        Svg: require('../../static/img/bg-shape-2.svg').default,
        description: (
            <>
                Interface Forge allows you to save the data created as
                file-system based fixtures, and auto-updates the fixtures when
                the factory's schema or parameters are changed.
            </>
        ),
    },
    {
        title: 'Powered by TypeScript',
        Svg: require('../../static/img/bg-shape-3.svg').default,
        description: (
            <>
                Interface Forge is written with and for TypeScript, allowing you
                to generate objects matching you strongly typed classes,
                interfaces and types.
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
