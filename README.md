# Squad

### Table of Contents
 - [Introduction](#Introduction)
 - [Architecture](#Architecture)
 - [Contribution Guide](#Contribution-Guide)
 - [Contact us](#Contact-us)
 
## Introduction
Squad is an open source video game store for community-designed games and a software development kit that helps game developers make games that support community-based design. The project's focuses include community contribution, curation markets, and decentralization.

## Architecture
WIP

Squad is made up of two products:
 - **Squad**, a game store and launcher
 - the **Squad SDK**, an SDK for allowing community submitted defintions (metadata for games and game-related elements), generating and purchasing tokens associated with those definitions, and curating those definitions by their market activity (curation markets). Used in the Squad platform and available for game makers who want to incorporate these features.

Squad is in the prototype / proof-of-concept stage. The current architecture uses:
 - Holochain to validate and store metadata
 - Ethereum to generate tokens via [curved bonds](https://medium.com/@simondlr/tokens-2-0-curved-token-bonding-in-curation-markets-1764a2e0bee5)
 - IPFS as a peer-to-peer networking shim
 
(Talk about Lerna/monorepo/package structure here if that gets stabilized)

## Contribution Guide
Squad is an open source project that welcomes contributions from anyone, as long as they follow our [contribution guide](CONTRIBUTING.md).

## Contact us
The best way to get in touch with people working on Squad directly is through our [Discord](https://discord.gg/AKnbAe9). The core contributors to Squad as of October, 2019, are:
 - Jesse B. Miller ("BayesianAgent | Jesse#2255" on Discord)
 - Ezra Weller ("Ezra Weller#4662" on Discord)
 
 We also stream development at [twitch.tv/setmatchgames](https://www.twitch.tv/setmatchgames)! Streams generally happen every Saturday from 11:30 AM - 2:30 PM EST.
