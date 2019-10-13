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

## Setting up a development environment

1. Install nix shell: `curl https://nixos.org/nix/install | sh`

2. Restart your terminal (or source bash) to make sure nix is now in your path.

3. Start the holochain nix shell: `nix-shell https://holochain.love --pure` or `nix-shell ./holonix --pure` for a stable version with the proper version of node.

4. Run `make develop` to set up the rest of the environment. This includes:
 - ganache-cli, a local test net for Ethereum, which will be logged in `ganache.log` in the squad folder.
 - holochain's test conductor, which will be logged in `holochain.log` in the squad folder.

5. In a command line in a new tab, start the nix shell (step 3) and then start the React app with `make react`. (I believe using the `--pure` tag for the nix-shell will _not_ work here because react-scripts needs your local environment variables, such as default browser.)

## Testing the roshambo-web game

1. Set up the development environment with both `make develop` and `make react` running (see above).

2. In a new command line, from the squad root folder, link the squad sdk into the roshambo-web folder: `$ ln -s ../../../sdk ./app_spec/roshambo-web/src/sdk`.

3. Navigate to /app_spec/roshambo-web and run `npm run start` to start the web game's local host. Close out of the window that automatically opens in your browser.

4. Go to the squad tab in your browser, look for the roshambo-web game in the Games catalog, and paste its url into a new tab. If everything's working, you should see a working UI.
