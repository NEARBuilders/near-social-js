// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docs: [
    'overview',
    {
      items: ['usage/getting-started'],
      label: 'Usage',
      link: {
        type: 'doc',
        id: 'usage/index',
      },
      type: 'category',
    },
    {
      items: ['advanced/reading-data', 'advanced/storing-data'],
      label: 'Advanced',
      link: {
        type: 'doc',
        id: 'advanced/index',
      },
      type: 'category',
    },
    {
      items: ['api-reference/social', 'api-reference/types'],
      label: 'API Reference',
      link: {
        type: 'doc',
        id: 'api-reference/index',
      },
      type: 'category',
    },
  ],
};

module.exports = sidebars;
