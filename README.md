<h1 align="center">
  NEAR Social SDK
</h1>

<p align="center">
  <a href="https://github.com/NEARBuilders/near-social-js/releases/latest">
    <img alt="GitHub Release" src="https://img.shields.io/github/v/release/NEARBuilders/near-social-js?&logo=github">
  </a>
  <a href="https://github.com/NEARBuilders/near-social-js/releases/latest">
    <img alt="GitHub Release Date - Published At" src="https://img.shields.io/github/release-date/NEARBuilders/near-social-js?logo=github">
  </a>
</p>

<p align="center">
  <a href="https://github.com/NEARBuilders/near-social-js/releases">
    <img alt="GitHub Pre-release" src="https://img.shields.io/github/v/release/NEARBuilders/near-social-js?include_prereleases&label=pre-release&logo=github">
  </a>
  <a href="https://github.com/NEARBuilders/near-social-js/releases">
    <img alt="GitHub Pre-release Date - Published At" src="https://img.shields.io/github/release-date-pre/NEARBuilders/near-social-js?label=pre-release date&logo=github">
  </a>
</p>

<p align="center">
  <a href="https://github.com/NEARBuilders/near-social-js/blob/main/LICENSE">
    <img alt="GitHub License" src="https://img.shields.io/github/license/NEARBuilders/near-social-js">
  </a>
</p>

<p align="center">
  <a href="https://npmjs.com/package/@builddao/near-social-js" target="_blank">
    <img src="https://img.shields.io/npm/v/@builddao/near-social-js" alt="npm" />
  </a>
</p>

<p align="center">
  A JavaScript SDK for interacting with the social contract (social.near) with helper functions for typical social features.
</p>

### Table of contents

* [1. Overview](#-1-overview)
* [2. Documentation](#-2-documentation)
* [3. Development](#-3-development)
  * [3.1. Requirements](#31-requirements)
  * [3.2. Setup](#32-setup)
  * [3.3. Build](#33-build)
* [4. Appendix](#-4-appendix)
  * [4.1. Useful Commands](#41-useful-commands)
* [5. How To Contribute](#-5-how-to-contribute)
* [6. License](#-6-license)

## 🔭 1. Overview

<sup>[Back to top ^][table-of-contents]</sup>

## 📚 2. Documentation

For full documentation, please see [here][documentation].

<sup>[Back to top ^][table-of-contents]</sup>

## 🛠 3. Development

### 3.1. Requirements

* Install [Node v18.20.2+][node]
* Install [Yarn v1.22.5+][yarn]

<sup>[Back to top ^][table-of-contents]</sup>

### 3.2. Setup

1. Install the dependencies:
```bash
$ yarn install
```

<sup>[Back to top ^][table-of-contents]</sup>

### 3.3. Build

* To build simply run:
```bash
$ yarn build
```

The above command will compile the Typescript source code into a `dist/` directory.

<sup>[Back to top ^][table-of-contents]</sup>

## 📑 4. Appendix

### 4.1. Useful Commands

| Command           | Description                                                                        |
|-------------------|------------------------------------------------------------------------------------|
| `yarn build`      | Builds the source code into the `dist/` directory.                                 |
| `yarn docs:build` | Builds the documentation into the `.docusaurus/` directory.                        |
| `yarn docs:serve` | Serves the built documentation from the `.docusaurus/` directory.                  |
| `yarn docs:start` | Builds and runs the documentation in a development environment with hot reloading. |
| `yarn lint`       | Runs the linter on `.js` and `.ts` files.                                          |
| `yarn node:start` | Starts up a NEAR development node in a background process.                         |
| `yarn node:start` | Stops the NEAR development node that was started in `yarn node:start`.             |
| `yarn prettier`   | Runs the prettier on `.js` and `.ts` files.                                        |
| `yarn test`       | Starts a NEAR development node and runs the tests.                                 |

<sup>[Back to top ^][table-of-contents]</sup>

## 👏 5. How To Contribute

Please read the [**Contributing Guide**][contribute] to learn about the development process.

<sup>[Back to top ^][table-of-contents]</sup>

## 📄 6. License

Please refer to the [LICENSE][license] file.

<sup>[Back to top ^][table-of-contents]</sup>

<!-- Links -->
[contribute]: ./CONTRIBUTING.md
[documentation]: https://https://nearbuilders.github.io//near-social-js
[license]: ./LICENSE
[node]: https://nodejs.org/en/
[table-of-contents]: #table-of-contents
[yarn]: https://yarnpkg.com/
