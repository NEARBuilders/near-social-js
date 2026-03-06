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
const npmLink = 'https://npmjs.com/package/near-social-js';
const url = 'https://nearbuilders.github.io';

// header
const tagline =
  'A JavaScript SDK for interacting with the social contract (social.near) with helper functions for typical social features.';
const title = 'NearSocial.JS';

/** @type {import('@docusaurus/types').Config} */
const config = {
  baseUrl: '/near-social-js',
  deploymentBranch: 'gh-pages',
  favicon: 'images/near-social-icon.svg',
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },
  onBrokenLinks: 'warn',
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
      image: 'images/social-card.png',
      metadata: [
        {
          name: 'keywords',
          content:
            'near, near protocol, NEAR Social, social.near, javascript sdk, near-social-js',
        },
        {
          name: 'description',
          content: tagline,
        },
        {
          property: 'og:title',
          content: title,
        },
        {
          property: 'og:description',
          content: tagline,
        },
        {
          property: 'og:image',
          content: `${url}/near-social-js/images/social-card.png`,
        },
        {
          name: 'twitter:card',
          content: 'summary_large_image',
        },
        {
          name: 'twitter:title',
          content: title,
        },
        {
          name: 'twitter:description',
          content: tagline,
        },
        {
          name: 'twitter:image',
          content: `${url}/near-social-js/images/social-card.png`,
        },
      ],
      navbar: {
        title: title,
        logo: {
          alt: 'NearSocial.JS',
          src: 'images/near-social-icon.svg',
          height: 26,
          width: 29,
        },
        items: [
          {
            type: 'doc',
            docId: 'overview',
            position: 'left',
            label: 'Overview',
          },
          {
            type: 'doc',
            docId: 'api-reference/index',
            position: 'left',
            label: 'API',
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
    <a
      class="footer__brand-link"
      href="${url}/near-social-js/"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="NearSocial.JS Documentation"
    >
      <img
        class="footer__brand-logo"
        src="/near-social-js/images/near-social-icon.svg"
        alt="NearSocial.JS"
      />
      <span class="footer__brand-text">${title}</span>
    </a>
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
              {
                label: 'Usage',
                to: '/usage',
              },
              {
                label: 'Cookbook',
                to: '/cookbook',
              },
              {
                label: 'API Reference',
                to: '/api-reference',
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
