const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

const title = 'Interface Forge';

module.exports = {
    title,
    tagline: 'Gracefully generate TypeScript mock data.',
    url: 'https://goldziher.github.io',
    baseUrl: '/interface-forge/',
    projectName: 'Interface Forge',
    organizationName: 'Goldziher',
    trailingSlash: true,
    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'warn',
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
                {
                    href: 'https://github.com/Goldziher/interface-forge',
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
                    editUrl:
                        'https://github.com/Goldziher/interface-forge/edit/gh-pages/docusaurus/',
                },
                theme: {
                    customCss: require.resolve('./src/css/custom.css'),
                },
            },
        ],
    ],
};
