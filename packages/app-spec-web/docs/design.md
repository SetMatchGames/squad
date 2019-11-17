# Design

This is a scratch space to work out the design considerations
of Automatic Chess as an App Spec Game

# Expandability

The biggest question in my mind is how expandability will work.
What will the data format of the components be and what
immutable rules will the game engine have?

## Moves function plus metadata option

The moves method option would be to have the component specify
`moves(space, context) -> [<legal move>...]`. The game would
instantiate pices for each moves method and call the moves
function to discover where the pice is allowed to in a given
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
