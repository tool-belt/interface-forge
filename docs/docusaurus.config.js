const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
    title: 'Interface-Forge',
    tagline: 'Gracefully generate dynamic mock data.',
    url: 'https://your-docusaurus-test-site.com',
    baseUrl: '/',
    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'warn',
    favicon: 'img/favicon.ico',
    organizationName: 'Goldziher',
    projectName: 'interfaceForge',
    themeConfig: {
        navbar: {
            title: 'interfaceForge',
            /* logo: {
                alt: 'interfaceForge',
                src: 'img/logo.svg',
            }, */
            items: [
                {
                    type: 'doc',
                    docId: 'table-of-contents',
                    position: 'left',
                    label: 'Contents',
                },
                {
                    type: 'doc',
                    docId: 'installation',
                    position: 'left',
                    label: 'Install',
                },
                {
                    position: 'left',
                    label: 'Usage',
                    items: [
                        {
                            type: 'doc',
                            docId: 'Usage/basic-example',
                            position: 'left',
                            label: 'Basic Example',
                        },
                        {
                            type: 'doc',
                            docId: 'Usage/passing-default-values',
                            position: 'left',
                            label: 'Passing Default Values',
                        },
                        {
                            type: 'doc',
                            docId: 'Usage/passing-a-factory-function',
                            position: 'left',
                            label: 'Passing a Factory Function',
                        },
                        {
                            type: 'doc',
                            docId: 'Usage/building-objects',
                            position: 'left',
                            label: 'Building Objects',
                        },
                        {
                            type: 'doc',
                            docId: 'Usage/batch-building',
                            position: 'left',
                            label: 'Batch Building',
                        },
                        {
                            type: 'doc',
                            docId: 'Usage/creating-and-using-fixtures',
                            position: 'left',
                            label: 'Creating and using Fixtures',
                        },
                    ],
                },
                {
                    type: 'doc',
                    docId: 'factory-schema',
                    position: 'left',
                    label: 'Schema',
                },
                {
                    type: 'doc',
                    docId: 'contributing',
                    position: 'left',
                    label: 'Contributing',
                },
                {
                    href: 'https://github.com/Goldziher/interfaceForge',
                    label: 'GitHub',
                    position: 'right',
                },
            ],
        },
        footer: {
            style: 'dark',
            links: [
                {
                    title: 'Docs',
                    items: [
                        {
                            label: 'Contents',
                            to: '/docs/table-of-contents',
                        },
                    ],
                },
                {
                    title: 'Community',
                    items: [],
                },
                {
                    title: 'More',
                    items: [
                        {
                            label: 'Tweet',
                            to: 'https://www.twitter.com/share?url=https://github.com/Goldziher/interfaceForge',
                        },
                        {
                            label: 'GitHub',
                            href: 'https://github.com/facebook/docusaurus',
                        },
                    ],
                },
            ],
        },
        prism: {
            theme: lightCodeTheme,
            darkTheme: darkCodeTheme,
        },
    },
    presets: [
        [
            '@docusaurus/preset-classic',
            {
                docs: {
                    sidebarPath: require.resolve('./sidebars.js'),
                    // Please change this to your repo.
                    editUrl:
                        'https://github.com/facebook/docusaurus/edit/master/website/',
                },
                blog: {
                    showReadingTime: true,
                    // Please change this to your repo.
                    editUrl:
                        'https://github.com/facebook/docusaurus/edit/master/website/blog/',
                },
                theme: {
                    customCss: require.resolve('./src/css/custom.css'),
                },
            },
        ],
    ],
};
