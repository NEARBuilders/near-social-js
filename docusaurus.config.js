// @ts-check
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const { themes } = require('prism-react-renderer');
/* eslint-enable @typescript-eslint/no-var-requires */

// directories
const docsDir = path.resolve(__dirname, 'docs');
const staticDir = path.resolve(docsDir, 'static');
const scriptsDir = path.resolve(docsDir, 'scripts');
const stylesDir = path.resolve(docsDir, 'styles');

// links
const buildDAOLink = 'https://nearbuilders.org';
const githubLink = 'https://github.com/NEARBuilders/near-social-js';
const npmLink = 'https://npmjs.com/package/@nearbuilders/near-social-js';
const url = 'https://nearbuilders.github.io';

// header
const tagline =
  'A JavaScript SDK for interacting with the social contract (social.near) with helper functions for typical social features.';
const title = 'Near Social SDK';

/** @type {import('@docusaurus/types').Config} */
const config = {
  baseUrl: '/near-social-js',
  deploymentBranch: 'gh-pages',
  favicon: 'images/favicon.png',
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'throw',
  onDuplicateRoutes: 'throw',
  organizationName: 'NEARBuilders',
  projectName: 'near-social-js',
  plugins: ['docusaurus-plugin-sass'],
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        blog: false,
        docs: {
          remarkPlugins: [
            [
              require('@docusaurus/remark-plugin-npm2yarn'),
              {
                sync: true,
              },
            ],
          ],
          routeBasePath: '/',
          sidebarPath: require.resolve(path.resolve(scriptsDir, 'sidebars.js')),
        },
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
          ignorePatterns: ['/tags/**'],
          filename: 'sitemap.xml',
        },
        theme: {
          customCss: [
            require.resolve(path.resolve(stylesDir, 'footer.scss')),
            require.resolve(path.resolve(stylesDir, 'functions.scss')),
            require.resolve(path.resolve(stylesDir, 'global.scss')),
            require.resolve(path.resolve(stylesDir, 'navbar.scss')),
          ],
        },
      }),
    ],
  ],
  staticDirectories: [staticDir],
  tagline,
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // TODO: create a social card
      // image: 'img/docusaurus-social-card.jpg',
      metadata: [
        {
          name: 'keywords',
          content: 'blockchain, near, nearprotocol',
        },
      ],
      navbar: {
        title,
        items: [
          {
            type: 'doc',
            docId: 'overview',
            position: 'left',
            label: 'Overview',
          },
          // right
          {
            href: githubLink,
            position: 'right',
            className: 'navbar__icon navbar__icon--github',
            'aria-label': 'GitHub repository',
          },
          {
            href: npmLink,
            position: 'right',
            className: 'navbar__icon navbar__icon--npm',
            'aria-label': 'npm registry',
          },
        ],
      },
      footer: {
        copyright: `
<div class="footer__copyright-container">
    <p class="footer__text">Licensed under <a class="footer__text--link" href="${githubLink}/blob/main/LICENSE" target="_blank">MIT</a>.</p>
</div>
        `,
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Overview',
                to: '/',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'GitHub',
                href: githubLink,
              },
              {
                label: 'npm',
                href: npmLink,
              },
            ],
          },
        ],
        logo: {
          alt: 'BuildDAO logo',
          height: '50px',
          href: buildDAOLink,
          src: '/images/build_dao-banner_logo.svg',
          target: '_blank',
        },
        style: 'dark',
      },
      prism: {
        darkTheme: themes.dracula,
        theme: themes.github,
      },
    }),
  title,
  trailingSlash: false,
  url,
};

module.exports = config;
