const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

const title = 'Interface Forge';

/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
    title,
    tagline: 'Graceful mock data and fixtures generation using TypeScript.',
    url: 'https://goldziher.github.io',
    baseUrl: '/interfaceForge/',
    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'warn',
    /* favicon: 'img/favicon.ico', */
    organizationName: 'Goldziher',
    projectName: title,
    themeConfig: {
        navbar: {
            title,
            style: 'dark',
            items: [
                {
                    type: 'doc',
                    docId: 'table-of-contents',
                    position: 'left',
                    label: 'Docs',
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
            copyright: `Interface Forge ${new Date().getFullYear()}. Built with Docusaurus.`,
            links: [
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
                    editUrl:
                        'https://github.com/Goldziher/interfaceForge/edit/main/docs/',
                },
                theme: {
                    customCss: require.resolve('./src/css/custom.css'),
                },
            },
        ],
    ],
};
