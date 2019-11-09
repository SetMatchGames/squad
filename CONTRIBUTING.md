# Contributing to Squad

Squad is an open source project that welcomes all contributions
following this guide. If you're reading this, thanks! We appreciate
your interest in the project and encourage you to try making a
contribution and joining the community.

### Table of Contents

- [Introduction](#Introduction)
- [Bugs and Suggestions](#Bugs-and-Suggestions)
- [Dev Environment Setup](#Dev-Environment-Setup)
- [Submitting Changes](#Submitting-Changes)
  * [Code Guidelines](#Code-Guidelines)
  * [Testing](#Testing)
  * [Pull Requests](#Pull-Requests)
- [Contact us](#Contact-us)

## Introduction

Before contributing, you should be familiar with [Squad](README.md)
and its architecture (LINK TO DOCUMENTATION) and have a clear idea of
what you're trying to achieve.

If you're not sure what type of contribution to make, you can look
through unaddressed github issues or join our
[Discord](https://discord.gg/AKnbAe9) and ask for ideas. We'll be
happy to give you something to do!

## Bugs and Suggestions

If you've found a bug, please go to Squad's [github
issues](https://www.github.com/setmatchgames/squad/issues), check if
the bug has already been submitted, and if it hasn't, submit a new
issue. Tag your issue with "bug" and use existing bug-tagged issues as
examples for how to format your submission.

If you'd like to request a new feature or a change, follow the same
protocol using the "suggestion" tag instead of "bug."

## Dev Environment Setup

WIP

### Requirements

1. Make
1. nix-shell
1. npm

To stand up a full dev environment, run the followin in separate
terminals

`make metastore`
`make squad-games-web`
`make app-spec-web`

TODO: seed the dev metastore with enough deffinitions to run the app
spec

TODO: `make app-spec-web` should not open a browser automatically,
you'll have to close that tab yourself for now.


## Submitting Changes
### Code Guidelines

Squad uses a number of languages and frameworks. Our approaches to
each are still forming, but we'll update them here as they stabilize:

TODO

**React/Redux**

**Non-React Javascript**

**Solidity**

**Rust**

### Linting

TODO

Javascript & React: StandardJS

Solidity: Solhint

Rust: Clippy? Maybe not necessary because of Rust's built in linting

### Testing

TODO

### Pull Requests
Squad uses a [develop -->
master](https://nvie.com/posts/a-successful-git-branching-model/#the-main-branches)
git branch structure. Your contribution should start with a fork of
the `develop` branch and end with a pull request to merge your fork
back into the `develop` branch.

Please give your pull request a clear title. If the request is a
 response to an issue, put `Issue [NUMBER]` at the beginning of the
 title. In the description, briefly explain:
 1. What changes are included in the pull request
 2. How these change are a valuable contribution to Squad
 3. Why you've implemented them the way you have

Before submitting your pull request, please make sure the automatic
tests pass or give a good reason why you are submitting with failing
tests (NOT IMPLEMENTED). We make an effort to respond to all pull
requests, and if your request is not merged, we'll be sure to give you
feedback about why.

That's it. Thank you for contributing to Squad!

## Contact us
The best way to get in touch with people working on Squad directly is
through our [Discord](https://discord.gg/AKnbAe9). The core
contributors to Squad as of October, 2019, are:
 - Jesse B. Miller ("BayesianAgent | Jesse#2255" on Discord)
 - Ezra Weller ("Ezra Weller#4662" on Discord)

