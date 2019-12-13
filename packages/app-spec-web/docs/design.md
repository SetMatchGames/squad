# Design

This is a scratch space to work out the design considerations
of Automatic Chess as an App Spec Game

# Security considerations

We either need to write a domain specific language for the game
or evaluate user generated javascript. I'm not confidant enough
in the completely untested curation market to suggest we blindly
evaluate user generted (and market curated) javascript.

This is an open question we need to address before really "going
live" (whatever that means)

# Expandability and the AI

The biggest question in my mind is how expandability will work.
What will the data format of the components be and what
immutable rules will the game engine have?

How will the AI know what to do with the expansions?

## Base rules of the game

Draft then Battle a random opponent†, repeat until last player standing.

†: how do we handle when there are three opponents left? start with 2 player game?

### Draft rules
TODO

### Battle rules

*Options*:
1. AI can choose from moves provided by components
2. Components can provide their moves based on context

Option two seems more flexible but might slightly raise the bar to participation




## Hooks option

The AI loop will have a number of lifecycle hooks and will
ask each piece what to do about it.

Possible hooks

* pre/post move
* pre/post removal
* pre/post gain status


## Moves function plus metadata option

The moves method option would be to have the component specify
`moves(space, context) -> [<legal move>...]`. The game would
instantiate pieces for each moves method and call the moves
function to discover where the piece is allowed to in a given
context.

```
// King
{
  meta: {classes: [king, classic]},
  moves: ([column, file], context) -> {
    return [
      [column+1, file],
      [column-1, file],
      [column, file+1],
      [column, file-1],
      [column+1, file+1],
      [column-1, file-1],
      [column+1, file-1],
      [column-1, file+1]
    ].filter(x => inBounds(x))
  }
}

// Knight King
{
  meta: {classes: [king, knight, shapeshifter]},
  moves([column, file], context) -> {
    const kingMoves = [
      [column+1, file],
      [column-1, file],
      [column, file+1],
      [column, file-1],
      [column+1, file+1],
      [column-1, file-1],
      [column+1, file-1],
      [column-1, file+1]
    ].filter(inBounds)
    const knightMoves = [
      [column+2, file+1],      
      [column+2, file-1],
      [column-2, file+1],
      [column-2, file-1],
      [column+1, file+2],
      [column+1, file-2],
      [column-1, file+2],
      [column-1, file-2]    
    ].filter(inBounds)
    if (context.myClasses[knight] >= 3) {
      return [...kingMoves, ...knightMoves]
    } else {
      return knightMoves
    }
  }
}
```
## Code to steal
https://github.com/oakmac/chessboardjs/

https://github.com/jhlywa/chess.js

https://github.com/nmrugg/stockfish.js/
