# Background

We are building a big hariy new system on a few big hairy
new platforms. In order to keep things working well
together we are borrowing a method from one of those
platforms, holochain. Thir app spec is a working
application that runs on the platform and acts as a
specification. If a code change breaks the app spec, the
code change is not to spec. otherwise it is

For us this is a game

# Current conditions

We've got an app spec that's not very well suited for
the platform. It's not worth playing, and it's not well
suited for expansion or the web.

# Goals

Build a game that will work well as a specification by:
* Alerting us when we've broken backwards compatability
* Provide good reference implementation patterns to game
  devs building on the platform
* Beg for the development of new platform features

# Strategy

Build a game with the following properties

* Simple
  * to reduce the overhead of understanding it as a 
    reference implmenetation
  * to reduce the barrier to contributing code
  * to highlight opportunities for new platform features
* Fun
  * so that bugs are found and reported by players
* Valuable
  * so we can test the market features of the platform
  * to test the community participation premise
  * so that the platform developers can earn a living
* Flexible
  * so that it can cover a wide range of platform features

# Plan

Build "Automatic Chess" a chess autobattler where players
draft pices from the format and arange them how they want
before the AI plays out the game.
