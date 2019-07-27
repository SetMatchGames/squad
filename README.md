# Squad

Prototype Set Match Games platform on Holochain

As Set Match Games is to Valve, Squad is to Steam.

Squad is the platform where game players and creators submit their contributions and browse contributions that have been submitted. All the things that Steam does internally (game vetting, game curating) will be done publicly.

# Setting up a development environment

1. Install nix shell: `curl https://nixos.org/nix/install | sh`

2. Restart your terminal (or source bash) to make sure nix is now in your path.

3. Start the holochain nix shell: `nix-shell https://holochain.love --pure` or `nix-shell ./holonix --pure` for a stable version with the proper version of node.

4. Run `make develop` to set up the rest of the environment. This includes:
 - ganache-cli, a local test net for Ethereum, which will be logged in `ganache.log` in the squad folder.
 - holochain's test conductor, which will be logged in `holochain.log` in the squad folder.

5. In a command line in a new tab, start the nix shell (step 3) and then start the React app with `make react`. (I believe using the `--pure` tag for the nix-shell will _not_ work here because react-scripts needs your local environment variables, such as default browser.)
