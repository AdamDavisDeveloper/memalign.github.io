
var assertionCount = 0
function assertTrue(condition, str) {
    if (!condition) {
      MALog.log("Failed assertion: " + str)
      throw "Failed assertion: " + str + "\n" + (new Error()).stack
    }
    assertionCount++
}

function assertEqualStrings(str1, str2) {
    if (str1 != str2) {
      let str = "Failed assertion: \"" + str1 + "\" does not equal \"" + str2 + "\""
      MALog.log(str)
      throw str + "\n" + (new Error()).stack
    }
    assertionCount++
}

function assertEqualArrays(arr1, arr2) {
  // From https://masteringjs.io/tutorials/fundamentals/compare-arrays
  let isEqual = Array.isArray(arr1) &&
    Array.isArray(arr2) &&
    arr1.length === arr2.length &&
    arr1.every((val, index) => val === arr2[index])

    if (!isEqual) {
      let str = "Failed assertion:\n\n\"" + arr1 + "\" does not equal\n\n\"" + arr2 + "\""
      MALog.log(str)
      throw str + "\n" + (new Error()).stack
    }
    assertionCount++
}



class UnitTests {

// MAUtils

  test_MAUtils_naturalLanguageStringForArray() {
    var str = MAUtils.naturalLanguageStringForArray(null, "and")
    assertEqualStrings(str, "")

    str = MAUtils.naturalLanguageStringForArray([], "and")
    assertEqualStrings(str, "")

    // One item

    str = MAUtils.naturalLanguageStringForArray(["dog"], "and")
    assertEqualStrings(str, "dog")

    str = MAUtils.naturalLanguageStringForArray([new MANoun("dog")], "and")
    assertEqualStrings(str, "a dog")

    // Two items

    str = MAUtils.naturalLanguageStringForArray(["dog", "cat"], "and")
    assertEqualStrings(str, "dog and cat")

    str = MAUtils.naturalLanguageStringForArray([new MANoun("dog"), new MANoun("cat")], "or")
    assertEqualStrings(str, "a dog or a cat")

    str = MAUtils.naturalLanguageStringForArray(["dog", new MANoun("cat")], "or")
    assertEqualStrings(str, "dog or a cat")

    // Three items

    str = MAUtils.naturalLanguageStringForArray(["dog", "cat", "mouse"], "and")
    assertEqualStrings(str, "dog, cat, and mouse")

    str = MAUtils.naturalLanguageStringForArray([new MANoun("dog"), new MANoun("cat"), new MANoun("bones")], "or")
    assertEqualStrings(str, "a dog, a cat, or some bones")

    str = MAUtils.naturalLanguageStringForArray(["dog", new MANoun("cat"), new MANoun("bones")], "or")
    assertEqualStrings(str, "dog, a cat, or some bones")
  }

  test_MAUtils_actionsComparator() {
    let strings = [
      "Look at dog",
      "Go northwest",
      "Go south",
      "Go north",
      "Take food",
      "Go southeast",
      "Go west",
      "Look at cat",
      "Go east",
    ]

    let expectation = [
      "Look at cat",
      "Look at dog",
      "Take food",
      "Go north",
      "Go south",
      "Go east",
      "Go west",
      "Go southeast",
      "Go northwest",
    ]
    assertEqualArrays(strings.sort(MAUtils.actionsComparator), expectation)
  }

// MADirection

  test_MADirection_opposite() {
    assertTrue(MADirection.opposite(MADirection.North) == MADirection.South, "north / south")
    assertTrue(MADirection.opposite(MADirection.South) == MADirection.North, "south / north")
  }

  test_MADirection_parseString() {
    assertTrue(MADirection.parseString("North") == MADirection.North, "north")
    assertTrue(MADirection.parseString("noRth") == MADirection.North, "north")
    assertTrue(MADirection.parseString("Go north to another room") == MADirection.North, "north")

    assertTrue(MADirection.parseString("north") == MADirection.North, "north")
    assertTrue(MADirection.parseString("south") == MADirection.South, "south")
    assertTrue(MADirection.parseString("east") == MADirection.East, "east")
    assertTrue(MADirection.parseString("west") == MADirection.West, "west")
    assertTrue(MADirection.parseString("southeast") == MADirection.SouthEast, "southeast")
    assertTrue(MADirection.parseString("northwest") == MADirection.NorthWest, "northwest")
    assertTrue(MADirection.parseString("southwest") == MADirection.SouthWest, "southwest")
    assertTrue(MADirection.parseString("northeast") == MADirection.NorthEast, "northeast")
    assertTrue(MADirection.parseString("up") == MADirection.Up, "up")
    assertTrue(MADirection.parseString("down") == MADirection.Down, "down")

  }

// MALocation

  test_MALocation_addLinkInDirection() {
    let loc1 = new MALocation("Bedroom")
    let loc2 = new MALocation("Bathroom")

    loc1.addLinkInDirection(MADirection.North, loc2)

    assertTrue(loc1.directionToLocation[MADirection.North].name == "Bathroom", "bathroom is north of bedroom")
    assertTrue(loc2.directionToLocation[MADirection.South].name == "Bedroom", "bedroom is south of bathroom")

    assertTrue(!loc1.directionToLocation[MADirection.East], "nothing east of bedroom")
  }

  test_MALocation_linkedLocationsString() {
    let loc1 = new MALocation("MainRoom")
    let loc2 = new MALocation("NorthRoom")
    let loc3 = new MALocation("SouthRoom")
    let loc4 = new MALocation("EastRoom")
    let loc5 = new MALocation("WestRoom")

    loc1.addLinkInDirection(MADirection.North, loc2)

    assertTrue(loc1.linkedLocationsString() == "You can head north.", "one unvisited")
    loc2.inspected = true
    assertTrue(loc1.linkedLocationsString() == "You can head north.", "one visited")


    loc1.addLinkInDirection(MADirection.South, loc3)
    assertTrue(loc1.linkedLocationsString() == "You can head north or south.", "two locs str")


    loc1.addLinkInDirection(MADirection.East, loc4)
    assertTrue(loc1.linkedLocationsString() == "You can head north, south, or east.", "three locs str")

    loc4.inspected = true
    assertTrue(loc1.linkedLocationsString() == "You can head north, south, or east.", "three locs str, two inspected")


    loc1.addLinkInDirection(MADirection.West, loc5)
    assertTrue(loc1.linkedLocationsString() == "You can head north, south, east, or west.", "four locs str, two inspected")
  }

  test_MALocation_visibleNounsString() {
    let loc = new MALocation("Main Room")

    assertEqualStrings(loc.visibleNounsString(), "There are no notable items nearby.")

    loc.nouns.push(new MANoun("dog"))
    assertEqualStrings(loc.visibleNounsString(), "The room contains a dog.")

    loc.nouns.push(new MANoun("cats"))
    assertEqualStrings(loc.visibleNounsString(), "The room contains a dog and some cats.")


    loc.nouns.push(new MANoun("log"))
    assertEqualStrings(loc.visibleNounsString(), "The room contains a dog, some cats, and a log.")
  }

// MAMap
  test_MAMap_oneLoc_uninspected() {
    let map = new MAMap()
    map.nameToLocation = {}

    let loc0_0 = new MALocation("room 👀👃")
    map.startLocation = loc0_0
    map.addLocation(loc0_0)

    let emojiMap = "\n" + map.emojiMap(loc0_0)

    let expectedMap =
`
⬛️⬛️⬛️⬛️
⬛️▫️▫️⬛️
⬛️▫️😶⬛️
⬛️⬛️⬛️⬛️
`
    assertEqualStrings(emojiMap, expectedMap)
  }

  test_MAMap_oneLoc_inspected() {
    let map = new MAMap()
    map.nameToLocation = {}

    let loc0_0 = new MALocation("room 👀👃")
    map.startLocation = loc0_0
    map.addLocation(loc0_0)

    loc0_0.inspected = true

    let emojiMap = "\n" + map.emojiMap(loc0_0)

    let expectedMap =
`
⬛️⬛️⬛️⬛️
⬛️▫️▫️⬛️
⬛️▫️😶⬛️
⬛️⬛️⬛️⬛️
`

    assertEqualStrings(emojiMap, expectedMap)
  }

  test_MAMap_twoLocs_westInspected_eastUninspected() {
    let map = new MAMap()
    map.nameToLocation = {}

    let loc0_0 = new MALocation("room 👀👃")
    map.startLocation = loc0_0
    map.addLocation(loc0_0)

    loc0_0.inspected = true

    let loc1_0 = new MALocation("room 📜1️⃣")
    map.addLocation(loc1_0)

    loc0_0.addLinkInDirection(MADirection.East, loc1_0)

    let emojiMap = "\n" + map.emojiMap(loc0_0)

    let expectedMap =
`
⬛️⬛️⬛️⬛️⬛️⬛️⬛️
⬛️▫️▫️⬛️▫️▫️⬛️
⬛️▫️😶▫️▫️▫️⬛️
⬛️⬛️⬛️⬛️⬛️⬛️⬛️
`

    assertEqualStrings(emojiMap, expectedMap)
  }

  test_MAMap_twoLocs_westUninspected_eastInspected() {
    let map = new MAMap()
    map.nameToLocation = {}

    let loc0_0 = new MALocation("room 👀👃")
    map.startLocation = loc0_0
    map.addLocation(loc0_0)

    let loc1_0 = new MALocation("room 📜1️⃣")
    map.addLocation(loc1_0)

    loc1_0.inspected = true

    loc0_0.addLinkInDirection(MADirection.East, loc1_0)

    let emojiMap = "\n" + map.emojiMap(loc1_0)

    let expectedMap =
`
⬛️⬛️⬛️⬛️⬛️⬛️⬛️
⬛️▫️▫️⬛️▫️▫️⬛️
⬛️▫️▫️▫️▫️😶⬛️
⬛️⬛️⬛️⬛️⬛️⬛️⬛️
`
    assertEqualStrings(emojiMap, expectedMap)
  }

  test_MAMap_twoLocs_westInspected_eastInspected() {
    let map = new MAMap()
    map.nameToLocation = {}

    let loc0_0 = new MALocation("room 👀👃")
    map.startLocation = loc0_0
    map.addLocation(loc0_0)

    loc0_0.inspected = true

    let loc1_0 = new MALocation("room 📜1️⃣")
    map.addLocation(loc1_0)

    loc1_0.inspected = true

    loc0_0.addLinkInDirection(MADirection.East, loc1_0)

    let emojiMap = "\n" + map.emojiMap(loc1_0)

    let expectedMap =
`
⬛️⬛️⬛️⬛️⬛️⬛️⬛️
⬛️▫️▫️⬛️▫️▫️⬛️
⬛️▫️▫️▫️▫️😶⬛️
⬛️⬛️⬛️⬛️⬛️⬛️⬛️
`

    assertEqualStrings(emojiMap, expectedMap)
  }

  test_MAMap_twoLocs_westUninspected_eastUninspected() {
    let map = new MAMap()
    map.nameToLocation = {}

    let loc0_0 = new MALocation("room 👀👃")
    map.startLocation = loc0_0
    map.addLocation(loc0_0)

    let loc1_0 = new MALocation("room 📜1️⃣")
    map.addLocation(loc1_0)

    loc0_0.addLinkInDirection(MADirection.East, loc1_0)

    let emojiMap = "\n" + map.emojiMap(loc1_0)

    let expectedMap =
`
⬛️⬛️⬛️⬛️⬛️⬛️⬛️
⬛️▫️▫️⬛️▫️▫️⬛️
⬛️▫️▫️▫️▫️😶⬛️
⬛️⬛️⬛️⬛️⬛️⬛️⬛️
`

    assertEqualStrings(emojiMap, expectedMap)
  }

  test_MAMap_twoLocs_northInspected_southUninspected() {
    let map = new MAMap()
    map.nameToLocation = {}

    let loc0_0 = new MALocation("room 👀👃")
    map.startLocation = loc0_0
    map.addLocation(loc0_0)

    loc0_0.inspected = true

    let loc0_1 = new MALocation("room 📜1️⃣")
    map.addLocation(loc0_1)

    loc0_0.addLinkInDirection(MADirection.South, loc0_1)

    let emojiMap = "\n" + map.emojiMap(loc0_0)

    let expectedMap =
`
⬛️⬛️⬛️⬛️
⬛️▫️▫️⬛️
⬛️▫️😶⬛️
⬛️⬛️▫️⬛️
⬛️▫️▫️⬛️
⬛️▫️▫️⬛️
⬛️⬛️⬛️⬛️
`

    assertEqualStrings(emojiMap, expectedMap)
  }

  test_MAMap_twoLocs_northUninspected_southInspected() {
    let map = new MAMap()
    map.nameToLocation = {}

    let loc0_0 = new MALocation("room 👀👃")
    map.startLocation = loc0_0
    map.addLocation(loc0_0)

    let loc0_1 = new MALocation("room 📜1️⃣")
    map.addLocation(loc0_1)

    loc0_1.inspected = true

    loc0_0.addLinkInDirection(MADirection.South, loc0_1)

    let emojiMap = "\n" + map.emojiMap(loc0_1)

    let expectedMap =
`
⬛️⬛️⬛️⬛️
⬛️▫️▫️⬛️
⬛️▫️▫️⬛️
⬛️⬛️▫️⬛️
⬛️▫️▫️⬛️
⬛️▫️😶⬛️
⬛️⬛️⬛️⬛️
`

    assertEqualStrings(emojiMap, expectedMap)
  }

  test_MAMap_twoLocs_northInspected_southInspected() {
    let map = new MAMap()
    map.nameToLocation = {}

    let loc0_0 = new MALocation("room 👀👃")
    map.startLocation = loc0_0
    map.addLocation(loc0_0)

    loc0_0.inspected = true

    let loc0_1 = new MALocation("room 📜1️⃣")
    map.addLocation(loc0_1)

    loc0_1.inspected = true

    loc0_0.addLinkInDirection(MADirection.South, loc0_1)

    let emojiMap = "\n" + map.emojiMap(loc0_1)

    let expectedMap =
`
⬛️⬛️⬛️⬛️
⬛️▫️▫️⬛️
⬛️▫️▫️⬛️
⬛️⬛️▫️⬛️
⬛️▫️▫️⬛️
⬛️▫️😶⬛️
⬛️⬛️⬛️⬛️
`

    assertEqualStrings(emojiMap, expectedMap)
  }

  test_MAMap_twoLocs_northUninspected_southUninspected() {
    let map = new MAMap()
    map.nameToLocation = {}

    let loc0_0 = new MALocation("room 👀👃")
    map.startLocation = loc0_0
    map.addLocation(loc0_0)

    let loc0_1 = new MALocation("room 📜1️⃣")
    map.addLocation(loc0_1)

    loc0_0.addLinkInDirection(MADirection.South, loc0_1)

    let emojiMap = "\n" + map.emojiMap(loc0_1)

    let expectedMap =
`
⬛️⬛️⬛️⬛️
⬛️▫️▫️⬛️
⬛️▫️▫️⬛️
⬛️⬛️▫️⬛️
⬛️▫️▫️⬛️
⬛️▫️😶⬛️
⬛️⬛️⬛️⬛️
`

    assertEqualStrings(emojiMap, expectedMap)
  }

// MANoun

  test_MANoun_inSentenceName() {
    let noun1 = new MANoun("dog")
    let noun2 = new MANoun("dogs")
    let noun3 = new MANoun("aardvark")
    let noun4 = new MANoun("aardvarks")

    assertEqualStrings(noun1.inSentenceName(), "a dog")
    assertEqualStrings(noun2.inSentenceName(), "some dogs")
    assertEqualStrings(noun3.inSentenceName(), "an aardvark")
    assertEqualStrings(noun4.inSentenceName(), "some aardvarks")
  }

// MAGameEngine

  lastLogContains(str, gameState, numBack) {
    if (!numBack) {
      numBack = 0
    }

    let logs = gameState.log.logs

    let checkedStrings = []

    var result = false
    for (var i = 0; i <= numBack; i++) {
      let strToCheck = logs[logs.length-i-1]
      checkedStrings.unshift(strToCheck)

      result = strToCheck.includes(str)
      if (result) {
        break
      }
    }

    if (!result) {
      console.log("lastLogContains: Check failed. Log does not contain \"" + str + "\". Logs checked:\n\n" + checkedStrings.join("\n"))
    }
    return result
  }

  test_MAGameEngine_unvisitedLocationName() {
    let gameState = new MAGameState()
    let gameEngine = new MAGameEngine()
    gameEngine.setupNewGame(gameState)
    MATestUtils.setupTestHooks(gameEngine, gameState)

    // Omitted in description
    assertTrue(this.lastLogContains("You can head east or west.", gameState), "omits room name")

    // Omitted in action
    assertTrue(gameEngine.hasActionLike("Go east", gameState), "can go east")
    assertTrue(!gameEngine.hasActionLike("Go east to ", gameState), "name omitted")
  }

  test_MAGameEngine_visitedLocationName() {
    let gameState = new MAGameState()
    let gameEngine = new MAGameEngine()
    gameEngine.setupNewGame(gameState)
    MATestUtils.setupTestHooks(gameEngine, gameState)

    gameEngine.performActionLike("Go east", gameState)
    gameEngine.performActionLike("Go west", gameState)

    // Still omits room name
    assertTrue(this.lastLogContains("You can head east or west.", gameState, 2), "omits inspected room name")

    // Action omits room name
    assertTrue(gameEngine.hasActionLike("Go east ➡️", gameState),  "name omitted in action")
  }

  test_MAGameEngine_beatGame() {
    let gameState = new MAGameState()
    let gameEngine = new MAGameEngine()
    gameEngine.setupNewGame(gameState)
    MATestUtils.setupTestHooks(gameEngine, gameState)

    gameEngine.performActionLike("Go east", gameState)
    gameEngine.performActionLike("Go south", gameState)
    gameEngine.performActionLike("Go east", gameState)
    gameEngine.performActionLike("Go west", gameState)
    gameEngine.performActionLike("Go north", gameState)
    assertTrue(this.lastLogContains("You hear a ghoulish moan", gameState), "ghoulish moan")
    assertTrue(!gameEngine.hasActionLike("Go", gameState),  "no go action")
    assertTrue(!gameEngine.hasActionLike("Look", gameState),  "no look action")
    gameEngine.performActionLike("Wonder", gameState)
    assertTrue(this.lastLogContains("You reawaken as a giant yellow sphere", gameState), "reawaken")
    assertEqualStrings(gameState.currentLocation.name, "(2,3)")
    assertTrue(gameState.map.locations().filter(x => x.name == "(2,1)")[0].hasNounNamed("ghost"), "ghost in (2,1)")
    assertTrue(!gameState.currentLocation.directionToLocation[MADirection.East].hasNounNamed("dot"), "dot still eaten")
    gameEngine.performActionLike("Go west", gameState)
    gameEngine.performActionLike("Go south", gameState)
    gameEngine.performActionLike("Go west", gameState)
    gameEngine.performActionLike("Go east", gameState)
    gameEngine.performActionLike("Go north", gameState)
    gameEngine.performActionLike("Go east", gameState)
    gameEngine.performActionLike("Go east", gameState)
    gameEngine.performActionLike("Go south", gameState)
    assertTrue(this.lastLogContains("The room contains some cherries", gameState), "cherries string")
    gameEngine.performActionLike("Eat cherries", gameState)
    assertTrue(this.lastLogContains("You savor the delicious, juicy cherries", gameState), "juicy cherries")
    gameEngine.performActionLike("Go north", gameState)
    assertTrue(this.lastLogContains("Your eyes desperately scan the room for anything edible. Not even a crumb.", gameState), "not even a crumb")
    gameEngine.performActionLike("Go north", gameState)
    gameEngine.performActionLike("Go east", gameState)
    assertTrue(this.lastLogContains("You can head west. A mysterious void extends to the east.", gameState, 2), "portal to the east")
    gameEngine.performActionLike("Go east", gameState)
    assertTrue(this.lastLogContains("You emerge on the other side", gameState, 2), "you emerge")
    assertTrue(this.lastLogContains("A mysterious void extends to the west.", gameState, 2), "portal to the west")
    assertTrue(this.lastLogContains("Your primal consumptive urge kicks in", gameState), "primal consumptive urge")
    gameEngine.performActionLike("Go west", gameState)
    assertTrue(this.lastLogContains("A mysterious void extends to the east.", gameState, 2), "portal to the east")
    gameEngine.performActionLike("Go west", gameState)
    gameEngine.performActionLike("Go north", gameState)
    gameEngine.performActionLike("Go west", gameState)
    assertTrue(this.lastLogContains("The room contains a power pellet", gameState, 2), "contains a power pellet")
    assertTrue(this.lastLogContains("The power pellet gives off a warm glow", gameState), "warm glow")
    assertTrue(gameState.currentLocation.hasNounNamed("power pellet"), "pellet present")
    gameEngine.performActionLike("Eat power pellet", gameState)
    assertTrue(this.lastLogContains("You devour the power pellet", gameState), "devour pellet")
    assertTrue(!gameState.currentLocation.hasNounNamed("power pellet"), "pellet gone")
    gameEngine.performActionLike("Go east", gameState)
    assertTrue(this.lastLogContains("You still feel the warmth of the power pellet", gameState), "feel the warmth")
    gameEngine.performActionLike("Go south", gameState)
    assertTrue(this.lastLogContains("Nearby, you hear the chattering of a scared ghost", gameState), "scared ghost")
    gameEngine.performActionLike("Eat scared ghost", gameState)
    assertTrue(this.lastLogContains("Teeth crash against teeth as you chomp down on the shadowy ghost", gameState), "chomp shadowy ghost")
    gameEngine.performActionLike("Look around", gameState)
    gameEngine.performActionLike("Look at floating eyes", gameState)
    assertTrue(this.lastLogContains("A wandering soul", gameState), "wandering soul")
    gameEngine.performActionLike("Go north", gameState)
    gameEngine.performActionLike("Go north", gameState)
    gameEngine.performActionLike("Go east", gameState)
    gameEngine.performActionLike("Go west", gameState)
    gameEngine.performActionLike("Go south", gameState)
    gameEngine.performActionLike("Go west", gameState)
    gameEngine.performActionLike("Go west", gameState)
    gameEngine.performActionLike("Go south", gameState)
    gameEngine.performActionLike("Go north", gameState)
    gameEngine.performActionLike("Go north", gameState)
    // Wait for the floating eyes to get to its home square to be restored as ghost
    gameEngine.performActionLike("Look around", gameState)
    gameEngine.performActionLike("Look around", gameState)
    gameEngine.performActionLike("Look around", gameState)
    gameEngine.performActionLike("Look around", gameState)
    gameEngine.performActionLike("Look around", gameState)
    gameEngine.performActionLike("Look around", gameState)
    gameEngine.performActionLike("Look around", gameState)
    gameEngine.performActionLike("Look around", gameState)
    gameEngine.performActionLike("Look around", gameState)
    gameEngine.performActionLike("Look around", gameState)
    gameEngine.performActionLike("Look around", gameState)
    gameEngine.performActionLike("Look around", gameState)
    gameEngine.performActionLike("Look around", gameState)
    gameEngine.performActionLike("Look around", gameState)
    gameEngine.performActionLike("Look around", gameState)
    gameEngine.performActionLike("Look around", gameState)
    gameEngine.performActionLike("Look around", gameState)
    gameEngine.performActionLike("Look around", gameState)
    gameEngine.performActionLike("Look around", gameState)
    gameEngine.performActionLike("Look around", gameState)
    gameEngine.performActionLike("Look around", gameState)
    gameEngine.performActionLike("Look around", gameState)
    gameEngine.performActionLike("Look around", gameState)
    gameEngine.performActionLike("Look around", gameState)
    gameEngine.performActionLike("Look around", gameState)
    assertTrue(gameState.map.locations().filter(x => x.name == "(2,1)")[0].hasNounNamed("ghost"), "ghost in (2,1)")
    gameEngine.performActionLike("Go west", gameState)
    assertTrue(this.lastLogContains("As you swallow this last morsel, the walls blink", gameState), "walls blink")
    assertTrue(this.lastLogContains("A glowing message appears in front of you: \"Score: 51\"", gameState), "score")
    assertTrue(this.lastLogContains("You reawaken back at the start", gameState), "back at the start")
    assertEqualStrings(gameState.currentLocation.name, "(2,3)")
    assertTrue(gameState.map.locations().filter(x => x.name == "(2,1)")[0].hasNounNamed("ghost"), "ghost in (2,1)")
    assertTrue(gameState.currentLocation.directionToLocation[MADirection.East].hasNounNamed("dot"), "dot restored")
    assertTrue(gameEngine.hasActionLike("Go east", gameState),  "has go east")
    assertTrue(gameEngine.hasActionLike("Go west", gameState),  "has go west")
  }

  test_MAGameEngine_powerPelletWearsOff() {
    let gameState = new MAGameState()
    let gameEngine = new MAGameEngine()
    gameEngine.setupNewGame(gameState)
    MATestUtils.setupTestHooks(gameEngine, gameState)

    gameEngine.performActionLike("Go east", gameState)
    gameEngine.performActionLike("Go north", gameState)
    gameEngine.performActionLike("Go east", gameState)
    gameEngine.performActionLike("Go east", gameState)
    gameEngine.performActionLike("Go east", gameState)
    gameEngine.performActionLike("Go south", gameState)
    gameEngine.performActionLike("Go north", gameState)
    gameEngine.performActionLike("Go south", gameState)
    // Assert that the logs don't contain a "noDot" hungry string even though there's no dot because there are cherries
    assertTrue(gameState.currentLocation.hasNounNamed("cherries"), "has cherries")
    assertTrue(this.lastLogContains("Dimly lit and filled with stale air.\n\nThe room contains some cherries.\n\nYou can head north, south, or east.", gameState), "room contains some cherries")
    gameEngine.performActionLike("Go north", gameState)
    gameEngine.performActionLike("Go west", gameState)
    gameEngine.performActionLike("Go east", gameState)
    gameEngine.performActionLike("Go north", gameState)
    gameEngine.performActionLike("Go east", gameState)
    // Assert that the logs don't contain a "noDot" hungry string even though there's no dot because there's a power pellet
    assertTrue(this.lastLogContains("A dark, depressing cell.\n\nThe room contains a power pellet.\n\nThe power pellet gives off a warm glow.\n\nYou can head east or west.", gameState), "room contains a power pellet")
     gameEngine.performActionLike("Eat power pellet", gameState)
    assertTrue(gameState.map.locations().filter(x => x.name == "(3,0)")[0].hasNounNamed("scared ghost"), "scared ghost in (3,0)")
    gameEngine.performActionLike("Go west", gameState)
    gameEngine.performActionLike("Go east", gameState)
    // Assert that the logs don't contain a "noDot" hungry string even though there's no dot because there's a scared ghost
    assertTrue(this.lastLogContains("A dark, depressing cell.\n\nThere are no notable items nearby.\n\nYou can head east or west.", gameState, 2), "no notable items")
    assertTrue(this.lastLogContains("Nearby, you hear the chattering of a scared ghost", gameState), "scared ghost chattering")
    gameEngine.performActionLike("Look around", gameState)
    gameEngine.performActionLike("Look around", gameState)
    gameEngine.performActionLike("Look around", gameState)
    gameEngine.performActionLike("Look around", gameState)
    assertTrue(gameState.map.locations().filter(x => x.name == "(1,2)")[0].hasNounNamed("ghost"), "ghost in (1,2)")
  }

  test_MAGameEngine_powerPelletAsLastDot() {
    let gameState = new MAGameState()
    let gameEngine = new MAGameEngine()
    gameEngine.setupNewGame(gameState)
    MATestUtils.setupTestHooks(gameEngine, gameState)

    gameEngine.performActionLike("Go west", gameState)
    gameEngine.performActionLike("Go south", gameState)
    gameEngine.performActionLike("Go west", gameState)
    gameEngine.performActionLike("Go east", gameState)
    gameEngine.performActionLike("Go north", gameState)
    gameEngine.performActionLike("Go north", gameState)
    gameEngine.performActionLike("Go west", gameState)
    gameEngine.performActionLike("Go east", gameState)
    gameEngine.performActionLike("Go north", gameState)
    gameEngine.performActionLike("Go north", gameState)
    gameEngine.performActionLike("Go west", gameState)
    gameEngine.performActionLike("Go east", gameState)
    gameEngine.performActionLike("Go south", gameState)
    gameEngine.performActionLike("Go east", gameState)
    gameEngine.performActionLike("Go west", gameState)
    gameEngine.performActionLike("Go east", gameState)
    gameEngine.performActionLike("Go west", gameState)
    gameEngine.performActionLike("Go east", gameState)
    gameEngine.performActionLike("Go east", gameState)
    gameEngine.performActionLike("Go north", gameState)
    gameEngine.performActionLike("Go east", gameState)
    gameEngine.performActionLike("Go west", gameState)
    gameEngine.performActionLike("Go south", gameState)
    gameEngine.performActionLike("Go south", gameState)
    gameEngine.performActionLike("Go south", gameState)
    gameEngine.performActionLike("Go south", gameState)
    gameEngine.performActionLike("Go east", gameState)
    gameEngine.performActionLike("Go west", gameState)
    gameEngine.performActionLike("Go north", gameState)
    gameEngine.performActionLike("Go north", gameState)
    gameEngine.performActionLike("Go east", gameState)
    gameEngine.performActionLike("Go east", gameState)
    gameEngine.performActionLike("Go east", gameState)
    gameEngine.performActionLike("Go north", gameState)
    gameEngine.performActionLike("Go east", gameState)
    gameEngine.performActionLike("Eat power pellet", gameState)
    assertTrue(this.lastLogContains("A glowing message appears in front of you: \"Score: 21\"", gameState), "score")
    assertTrue(this.lastLogContains("You reawaken back at the start", gameState), "back at the start")
    assertEqualStrings(gameState.currentLocation.name, "(2,3)")
    assertTrue(gameState.map.locations().filter(x => x.name == "(2,1)")[0].hasNounNamed("ghost"), "ghost in (2,1)")
    gameEngine.performActionLike("Look around", gameState)
    gameEngine.performActionLike("Go east", gameState)
    gameEngine.performActionLike("Go west", gameState)
    // Power pellet is not in effect so we see a hungry string:
    assertTrue(this.lastLogContains("You curse the sight of an empty room.", gameState), "hungry string")
    gameEngine.performActionLike("", gameState)
    gameEngine.performActionLike("", gameState)
  }


// Unit test harness

  run() {
    let methods = Object.getOwnPropertyNames(Object.getPrototypeOf(this))

    let passCount = 0
    for (let method of methods) {
      if (method.startsWith("test")) {
        MALog.log("=== Invoking " + method + " ===")
        this[method]();
        passCount++
      }
    }
    MALog.log(passCount + " tests and " + assertionCount + " assertions passed successfully!")
  }
}

// Run with:
//  let ut = new UnitTests()
//  ut.run()