export default function findWinner(p1Name, p1Component, p2Name, p2Component) {
    let p1Data = JSON.parse(p1Component.data)
    let p2Data = JSON.parse(p2Component.data)
    // Check all the options of which choice wins and loses against the other
    // choice
    if (p1Data.winsAgainst.includes(p2Component.name)) {
        return p1Name
    }
    if (p2Data.winsAgainst.includes(p1Component.name)) {
        return p2Name
    }
    if (p1Data.losesAgainst.includes(p2Component.name)) {
        return p2Name
    }
    if (p2Data.losesAgainst.includes(p1Component.name)) {
        return p1Name
    }

    // if there is no unique winner:
    return "draw"

}