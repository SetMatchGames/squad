export default function findWinner(p1Name, p1Component, p2Name, p2Component) {

    // Check all the options of which choice wins and loses against the other
    // choice
    if (p1Component.data.winsAgainst.includes(p2Component.name)) {
        return p1Name
    }
    if (p2Component.data.winsAgainst.includes(p1Component.name)) {
        return p2Name
    }
    if (p1Component.data.losesAgainst.includes(p2Component.name)) {
        return p2Name
    }
    if (p2Component.data.losesAgainst.includes(p1Component.name)) {
        return p1Name
    }

    // if there is no unique winner:
    return false

}