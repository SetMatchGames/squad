# Squad Chess

## Goals

The requirements for the project

* Automatable (turned into Automatic Chess)
* Large design space
* Metadata driven (pieces are components)
* Browser-playable
* Videogame-native (not pen and paper)
* Worth playing if you like chess

# Game

## Rules

Starting point: Rules of Chess

*Changes:*
* No castling
* No en passant capturing
* No check or checkmate! (Win by capturing the king)

*Motivation behind these changes:*
Castling and en passant are mechanics that might be added later, but are complex
and obscure enough that we think it’s worth skipping them initially. It’s also
worth remembering that in Automatic Chess, the games will be played by engines,
where the criteria are different.

Check and checkmate both add a lot of computational complexity to determining a
winner compared to capturing the king and we don’t believe that checkmate adds
any gameplay value when the AI is battling for you. 

### Adding custom pieces

People should be able to submit pieces that combine the movement rules and 
mechanics that already exist in the game:

* A piece that moves diagonally like a bishop but can only move forwards
  like a pawn
* A piece that can move like a knight and also get promoted like a pawn 

### Mechanics that should be possible

Brainstorm mechanics we might want to play with

* Pieces that change based on context
  * Color square they are on
  * Are they being attacked (!)
  * Are they defending a piece (!)
  * Only on the piece’s Nth move
    * Prime numbered moves
    * Even numbered moves
  * What happened on the previous move
    * A piece got captured, etc.
  * Some number of other pieces of a given type on the board
  * Some number of other pieces in the starting position
  * Only move if they are on a certain square
* Pieces that capture on different squares than they move to
* Move other pieces as a part of its move
* Add pieces to the board
* Curved slopes

# Architecture

Data structures for components, mechanics, etc.

## Mechanics

Deconstruct the properties of chess moves

*Pawn*

* Only move forward
* Only take forward
* Only move with a 1:0 slope
* Only take with a 1:1 slope
* One step at a time

*Generically*

* Max N steps per move (without going off the board)
* Let component designers chose a large enough N to move to any space on the board
* Take or move at slope (offsets)
* *Moves through pieces
* *No mirror for opponent (like a pawn that can move only towards the white side no matter what color the piece is)

*Not in the game to start with but could be added

Potentially but complex

* Multiple takes/moves
