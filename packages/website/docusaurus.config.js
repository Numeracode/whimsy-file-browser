/** @type {import('@docusaurus/types').DocusaurusConfig} */
const chonkyPackage = require('@numeracode/whimsy-file-browser/package.json');
module.exports = {
  title: 'Whimsy File Browser',
  tagline: 'A File Browser for React',
  url: 'https://github.com',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.png',
  organizationName: 'Numeracode',
  projectName: 'whimsy-file-browser',
  themeConfig: {
    navbar: {
      title: `Whimsy File Browser v${chonkyPackage.version}`,
      logo: {
        alt: 'Whimsy File Browser',
        src: 'img/chonky-sphere-v2.png',
      },
      items: [
        {
          type: 'doc',
          docId: 'intro',
          position: 'left',
          label: 'Docs',
        },
        {
          href: 'https://github.com/Numeracode/whimsy-file-browser',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    liveCodeBlock: {
      playgroundPosition: 'top',
    },
    prism: {
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Tutorial',
              to: '/docs/intro',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Stack Overflow',
              href: 'https://stackoverflow.com/questions/tagged/docusaurus',
            },
            {
              label: 'Discord',
              href: 'https://discordapp.com/invite/docusaurus',
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/docusaurus',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/Numeracode/whimsy-file-browser',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Numeracode. Built with Docusaurus.`,
    },
  },
  plugins: ['@docusaurus/theme-live-codeblock'],
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl:
            'https://github.com/Numeracode/whimsy-file-browser/edit/2.x/packages/website/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            'https://github.com/Numeracode/whimsy-file-browser/edit/2.x/packages/website/blog/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
