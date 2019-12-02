# App Spec Design: Automatic Chess

## Concept
An [autobattler](https://en.wikipedia.org/wiki/Auto_battler) based on regular chess! 
Players draft their pieces at the start of a game, arrange those pieces on the board, 
and then the two boards will play against each other using identical, basic, chess engines.

## Goals
 - Worth playing
 - Simple to understand base game
 - Large design space
 - Well suited to "componentification"
 - Testable (?)
 - Multiplayer Orthogame (2-8 players per match)
 - Browser-playable
 - Videogame-native (not pen and paper)

## Definitions (Metadata)
 - Game: Automatic Chess
 - Components: Pieces
 - Formats: Groups of pieces
 - Maybe (Mechanics: rules for movement that pieces reference)
 
## Gameplay Design
### Prematch: Matchmaking
tbd
### Big decisions TBD
 - Should a match have one big draft at the beginning followed by playing? Or a repeated draft-battle loop like most autobattlers?
#### Stage 1: Draft
Create a shared pool of pieces, split into packs:
 - Equal numbers of each piece in the pool?
 - More of the weaker pieces, fewer of the stronger ones?
 - Split into packs 100% randomly? Or in a set pattern?

Possible draft mechanics:
 - MTG style: get shown lots of packs, pick one piece from each pack
 - Autochess style: get shown one pack, buy any number of pieces, pay to reroll the pack. 
 Players get gold at the beginning of each draft = 5 + (1 * current_gold/10) + (1 if they won the last round).

Players always each get exactly one King (or a piece that plays that role).
#### Stage 2: Piece placement
Players get matched up with an opponent within the game. Each player places their pieces on the board.
Possible piece placement mechanics:
 - Players place their pieces one at a time, so they can respond to each other's choices.
 - Players can place pieces up to some total score. Each piece counts a certain amount towards that score, 
 with more powerful pieces having higher scores. If multiple rounds, players can raise this score by paying 
 to level up, plus auto-leveling each round.
#### Stage 3: Playing
The two boards play eachother with the traditional chess rules (to check mate), with an identical engine piloting both sides.
Possible play result mechanics:
 - Simple best of X matches (or best record in a round robin), with players getting to re-place pieces before each match.
 - Autobattler mechanics: winners get +1 gold, losers lose "life" equal to the number of pieces the opponent had when 
 they won. Lose all your life and you're out, last player standing wins.
