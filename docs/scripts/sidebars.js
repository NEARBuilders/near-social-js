// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docs: [
    'overview',
    'cookbook',
    {
      items: ['usage/getting-started'],
      label: 'Usage',
      link: {
        type: 'doc',
        id: 'usage/index',
      },
      type: 'category',
    },
    'api-reference/index',
  ],
};

module.exports = sidebars;
