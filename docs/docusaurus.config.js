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
                    //type: 'doc',
                    position: 'left',
                    label: 'Usage',
                    //docId: 'Usage/basic-example',
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
                // { type: 'search', position: 'right' }, // @docusaurus/theme-search-algolia
                {
                    href: 'https://github.com/Goldziher/interfaceForge',
                    label: 'GitHub',
                    position: 'right',
                },
            ],
        },
        footer: {
            style: 'light',
            /* logo: {
                alt: 'interfaceForge Open Source Logo',
                src: 'img/logo.svg',
                href: 'https://github.com/Goldziher/interfaceForge',
            }, */
            copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`,
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
                            href: 'https://www.twitter.com/share?url=https://github.com/Goldziher/interfaceForge',
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
