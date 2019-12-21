# App Spec Design: Automatic Chess

## Concept

An [autobattler](https://en.wikipedia.org/wiki/Auto_battler) based on regular chess! Players draft their pieces at the start of a game, arrange those pieces on the board, and then the two boards will play against each other using identical, basic, chess engines.

## Goals

* Worth playing
* Simple to understand base game
* Large design space
* Well suited to "componentification"
* Testable (?)
* Multiplayer Orthogame (2-8 players per match)
* Browser-playable
* Videogame-native (not pen and paper)

## Definitions (Metadata)

A reference to the game framework: a web app with a set of rules that accept “Chess Piece” definitions and “Piece List” definitions.

## Chess Pieces (component definition)

Each chess piece will be defined as a component, with rules set in a specific data format accepted by the Automatic Chess game.

## Piece Sets (format definition)

Piece sets are lists of valid chess pieces that Automatic Chess uses to decide which pieces will be used in a match.

# Gameplay Design

## Prematch: Matchmaking

tbd

## Gameplay Loop

In order to highlight the component/format aspects of squad games, we'll defer to existing autobattlers for as many design decisions as we can.

### Stage 1: Draft

Create a shared pool of pieces, split into packs:

* Equal numbers of each piece in the pool?
* More of the weaker pieces, fewer of the stronger ones?
* Split into packs 100% randomly? Or in a set pattern?

Draft mechanics (like autobattlers):

* Get shown one pack, buy any number of pieces, pay to reroll the pack.
* Players get gold at the beginning of each draft
  * 5 + (1 * current_gold/10) + (1 if they won the last round).

Players always each get exactly one King (or a piece that plays that role).

### Stage 2: Piece placement

Players get matched up with an opponent within the game. Each player places their pieces on the board.

Possible piece placement mechanics:

* Players take turns placing their pieces one at a time, so they can respond to each other's choices.
* Players can place pieces up to some total score. Each piece counts a certain amount towards that score, with more powerful pieces having higher scores. If multiple rounds, players can raise this score by paying to level up, plus auto-leveling each round.

# Stage 3: Playing

The two boards play each other with the squad chess rules (play to taking the king), with an identical engine piloting both sides.

Result mechanics (like autobattlers):

* Winners get +1 gold
* losers lose "life" equal to the number of pieces the opponent had when they won
* Lose all your life and you're out
* last player standing wins.
