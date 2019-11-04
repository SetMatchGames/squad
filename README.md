# Squad

Squad is an open source video game store for community-designed
games. Focuses include community contribution, curation markets, and
decentralization.


Squad is made up of two products:
 - the **Squad store**, a game store and launcher
 - the **Squad SDK**, an SDK for allowing community submitted
 defintions (metadata for games and game-related elements), generating
 and purchasing tokens associated with those definitions, and curating
 those definitions by their market activity (curation markets). Used
 in the Squad platform and available for game makers who want to
 incorporate these features.

## Architecture
Squad is in the prototype / proof-of-concept stage. The current
architecture uses:
 - Holochain to validate and store metadata
 - Ethereum to generate tokens via [curved
 bonds](https://medium.com/@simondlr/tokens-2-0-curved-token-bonding-in-curation-markets-1764a2e0bee5)
 - IPFS as a peer-to-peer networking shim

TBD

## Contribution Guide
TBD

# Local Development Environment

## Requirements

1. make
1. nix-shell
1. npm

## make commands

The following make commands can be used in separate terminals to set
up a full dev environment.

```
> make metastore
> make squad-games-web
> make app-spec-web
```

`make clean` removes (all?) build artifacts, stops the devnet, and
gives the option to remove all node_modules folders.
