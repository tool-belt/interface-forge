const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
    title: 'Interface Forge',
    tagline: 'Graceful mock data and fixtures generation using TypeScript.',
    url: 'https://your-docusaurus-test-site.com',
    baseUrl: '/',
    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'warn',
    favicon: 'img/favicon.ico',
    organizationName: 'Goldziher',
    projectName: 'Interface Forge',
    themeConfig: {
        navbar: {
            title: 'Interface Forge',
            style: 'dark',
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
                            to: '/docs/usage/basic-example',
                            label: 'Basic Example',
                        },
                        {
                            to: '/docs/usage/passing-default-values',
                            label: 'Passing Default Values',
                        },
                        {
                            to: '/docs/usage/passing-a-factory-function',
                            label: 'Passing a Factory Function',
                        },
                        {
                            to: '/docs/usage/building-objects',
                            label: 'Building Objects',
                        },
                        {
                            to: '/docs/usage/batch-building',
                            label: 'Batch Building',
                        },
                        {
                            to: '/docs/usage/creating-and-using-fixtures',
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
