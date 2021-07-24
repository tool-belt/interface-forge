const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

const title = 'Interface Forge';

module.exports = {
    title,
    tagline: 'Graceful mock data and fixtures generation using TypeScript.',
    url: 'https://goldziher.github.io',
    baseUrl: '/interfaceForge/',
    projectName: 'interfaceForge',
    organizationName: 'Goldziher',
    trailingSlash: false,
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
