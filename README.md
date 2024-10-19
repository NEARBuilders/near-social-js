<!-- markdownlint-disable MD014 -->
<!-- markdownlint-disable MD033 -->
<!-- markdownlint-disable MD041 -->
<!-- markdownlint-disable MD029 -->

<div align="center">

<h1 style="font-size: 2.5rem; font-weight: bold;">near-social-js</h1>

  <p>
    <strong>Typescript SDK for interacting with the social contract (social.near)</strong>
  </p>

</div>

<details>
  <summary>Table of Contents</summary>

- [Getting Started](#getting-started)
  - [Installing dependencies](#installing-dependencies)
  - [Running the app](#running-the-app)
  - [Building for production](#building-for-production)
  - [Running tests](#running-tests)
- [Contributing](#contributing)

</details>

## Getting Started

### Installing dependencies

```bash
yarn install
```

### Running the app

First, run the development server:

```bash
yarn run dev
```

### Building for production

```bash
yarn run build
```

### Running tests

```bash
yarn run test
```

See the full [testing guide](./playwright-tests/README.md).

## Appendix

### Social Contract

| Network | Account ID            | Link                                                                                                                   |
|---------|-----------------------|------------------------------------------------------------------------------------------------------------------------|
| Mainnet | `social.near`         | [https://nearblocks.io/address/social.near](https://nearblocks.io/address/social.near)                                 |
| Testnet | `v1.social08.testnet` | [https://testnet.nearblocks.io/address/v1.social08.testnet](https://testnet.nearblocks.io/address/v1.social08.testnet) |


### Useful Commands

| Command           | Description                                                                        |
|-------------------|------------------------------------------------------------------------------------|
| `yarn build`      | Builds the source code into the `dist/` directory.                                 |
| `yarn docs:build` | Builds the documentation into the `.docusaurus/` directory.                        |
| `yarn docs:serve` | Serves the built documentation from the `.docusaurus/` directory.                  |
| `yarn docs:start` | Builds and runs the documentation in a development environment with hot reloading. |
| `yarn lint`       | Runs the linter on `.js` and `.ts` files.                                          |
| `yarn node:start` | Starts up a NEAR development node in a background process.                         |
| `yarn node:start` | Stops the NEAR development node that was started in `yarn node:start`.             |
| `yarn fmt`   | Runs prettier on `.js` and `.ts` files.                                        |
| `yarn test`       | Starts a NEAR development node and runs the tests.                                 |

<!-- Links -->
[contribute]: ./CONTRIBUTING.md
[documentation]: https://nearbuilders.github.io/near-social-js
[license]: ./LICENSE
[node]: https://nodejs.org/en/
[table-of-contents]: #table-of-contents
[yarn]: https://yarnpkg.com/


## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you're interested in contributing to this project, please read the [contribution guide](./CONTRIBUTING).

<div align="right">
<a href="https://nearbuilders.org" target="_blank">
<img
  src="https://builders.mypinata.cloud/ipfs/QmWt1Nm47rypXFEamgeuadkvZendaUvAkcgJ3vtYf1rBFj"
  alt="Near Builders"
  height="40"
/>
</a>
</div>
