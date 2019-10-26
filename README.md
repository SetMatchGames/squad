# Squad

Squad is an open source video game store for community-designed games. Focuses include community contribution, curation markets, and decentralization.

Squad is made up of two products:
 - the **Squad store**, a game store and launcher
 - the **Squad SDK**, an SDK for allowing community submitted defintions (metadata for games and game-related elements), generating and purchasing tokens associated with those definitions, and curating those definitions by their market activity (curation markets). Used in the Squad platform and available for game makers who want to incorporate these features.

## Architecture
Squad is in the prototype / proof-of-concept stage. The current architecture uses:
 - Holochain to validate and store metadata
 - Ethereum to generate tokens via [curved bonds](https://medium.com/@simondlr/tokens-2-0-curved-token-bonding-in-curation-markets-1764a2e0bee5)
 - IPFS as a peer-to-peer networking shim
 
TBD

## Contribution Guide
TBD

# Local Development Environment

## Requirements

1. Make
1. Docker

## make develop

`make develop` starts a full local development environment with all services running, all applications launched, and test suites being watched:

* Metastore
  * 3 nodes
* Curation Market
  * Ganache local test net
* Squad Games
* App Spec Web Game
