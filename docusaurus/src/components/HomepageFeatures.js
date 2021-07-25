import React from 'react';
import styles from './HomepageFeatures.module.css';

const FeatureList = [
    {
        title: 'Generate Mock Data',
        description: (
            <>
                Interface Forge offers flexible mock data generation including:
                Sync and async data generation, built-in iterators, batch-
                creation methods and function-based factories.
            </>
        ),
    },
    {
        title: 'Create Fixtures',
        description: (
            <>
                Interface Forge allows you to save generated data as
                file-system based fixtures – it also auto-updates them
                whenever the factory's schema or its parameters have changed.
            </>
        ),
    },
    {
        title: 'Powered by TypeScript',
        description: (
            <>
                Interface Forge is written with and for TypeScript, allowing you
                to generate objects matching your own types and strongly typed
                classes/interfaces.
            </>
        ),
    },
];

function Feature({ title, description }) {
    return (
        <article className={styles.feature}>
            <h3>{title}</h3>
            <p>{description}</p>
        </article>
    );
}

export default function HomepageFeatures() {
    return (
        <section className={styles.features}>
            {FeatureList.map((props, idx) => (
                <Feature key={idx} {...props} />
            ))}
        </section>
    );
}
