// This runs in Node.js. Don't use client-side code here (browser APIs, JSX...).

const {themes: prismThemes} = require('prism-react-renderer');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Logger',
  tagline: 'Production-grade, platform-independent logging for React Native and the web',

  url: 'https://88khp.github.io',
  baseUrl: '/logger/',

  organizationName: '88khp',
  projectName: 'logger',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.js',
          editUrl: 'https://github.com/88khp/logger/tree/main/website/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      },
    ],
  ],

  themeConfig: {
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Logger',
      items: [
        {type: 'docSidebar', sidebarId: 'docsSidebar', position: 'left', label: 'Docs'},
        {href: 'https://github.com/88khp/logger', label: 'GitHub', position: 'right'},
        {href: 'https://www.npmjs.com/package/@88khp/logger', label: 'npm', position: 'right'},
      ],
    },
    footer: {
      style: 'dark',
      copyright: `Copyright © ${new Date().getFullYear()} 88khp · @88khp/logger. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'tsx'],
    },
  },
};

module.exports = config;
