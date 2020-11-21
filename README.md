# Squad (README OUT OF DATE!!!)

Squad is an open source project consisting of
1. a video game store for community-designed games and
1. a software development kit that helps game developers support
community-based design.

The Squad-SDK is a software development kit that supports
community-designed video games. Building with the Squad-SDK will let
you build a game that allows community created and curated components,
formats, and other elements inside your game. With the SDK, a game's
community can 1) submit game elements, 2) buy them, 3), curate them
(via curation markets), and 4) license and profit off their
contributions.

### Table of Contents
 - [In this repo](#In-this-repo)
 - [Contribution Guide](#Contribution-Guide)
 - [Contact us](#Contact-us)

## In this repo
Inside the `packages` folder of this repo, you'll find:
 - [**app-spec-web**](/packages/app-spec-web): an example game that
 supports community design, built using the Squad SDK.
 - [**curation-market**](/packages/curation-market): an autonomous
 market maker for tokens connected with games and game elements, built
 on Ethereum. This is how users will buy/sell games and game pieces.
 - [**metastore**](/packages/metastore): Decentralized storage for
 metadata representing games and game pieces, built mostly using
 Holochain. This metadata links users to actual game data.
 - [**squad-games-web**](/packages/squad-games-web): Web
 implementation of a game store and discovery engine for games that
 use the Squad-SDK.
 - [**squad-sdk**](/packages/squad-sdk): Software development kit for
 enabling community-design features in video games.

## Contribution Guide
Squad is an open source project that welcomes contributions from
anyone, as long as they follow our [contribution
guide](CONTRIBUTING.md).

## Contact us
The best way to get in touch with people working on Squad directly is
through our [Discord](https://discord.gg/AKnbAe9). The core
contributors to Squad as of October, 2019, are:
 - Jesse B. Miller ("BayesianAgent | Jesse#2255" on Discord)
 - Ezra Weller ("Ezra Weller#4662" on Discord)

 We also stream development at
 [twitch.tv/setmatchgames](https://www.twitch.tv/setmatchgames)!
 Streams generally happen every Saturday from 11:30 AM - 2:30 PM EST.

## Dev environment instructions
`npx hardhat node` in SquadGames/Squad
`TREASURY_ADDRESS=0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266 USER_ADDRESS=0x70997970c51812dc3a010c7d01b50e0d17dc79c8 npm run deploy-local` in SquadGames/Squad, 2nd tab
`make squad-chess`

### Using local subgraph
Run dev env as above.

In graph-node, make sure docker/data is deleted.

Make sure `network` in subgraph manifest is `mainnet`.

Run `docker-compose up`
