const rambda = require('rambda')
const similarity = require('compute-cosine-similarity')
const _ = require('lodash')
const crypto = require("crypto")
//const { blake2bl } = require('../../utils/crypto')

const blake = function(d){
	return crypto.createHash("sha256").update(d).digest("hex")
}

function getExpFactorDiff (calculatedDifficulty, parentBlockHeight) {
  let periodCount = (parentBlockHeight + 1) / 66000000
  if (periodCount > 2) {
    return calculatedDifficulty + (2 ^ (periodCount - 2))
  }

  return calculatedDifficulty
}

/**
 * FUNCTION: getDiff(t)
 *   Gets the difficulty of a given blockchain without singularity calculation
 *
 * handicap
 * => [nonce, difficulty]
 */
function getDiff (currentBlockTs, parentBlockTs, parentDifficulty, minimumDifficulty, handicap = 0) {
  const elapsedTime = currentBlockTs - parentBlockTs

  if (elapsedTime !== 0) {
    minimumDifficulty /= elapsedTime
  } else {
    minimumDifficulty = 1
  }

  let x = 1 - (elapsedTime / 5) + handicap // 4 => stejny childbloky, 0 => ruzny casy child blokud
  let z = 1
  x = (x < -99) ? -99 : x

  if (x === 0 && elapsedTime > 7) {
    x -= 1
  } else {
    x = x * (5 - elapsedTime) ^ 3
  }

  let y = parentDifficulty / minimumDifficulty
  x = (x * y) + parentDifficulty

  return Math.max(x, minimumDifficulty)
}

function main () {
  const previousChildTs = [1, 2, 3, 4, 5]
  const currentChildTs = [2, 3, 4, 5, 6]
  const currentChildTs = [0, 0, 1, 0, 0]
  const childsCount = 5

  const work = 'efg'

  let handicap = 0 // 4 pokud se ani jeden TS nelisi

  const genesisBlock = {
    difficulty: 141129464479256,
    timestamp: ((Date.now * 1000) << 0) - 70,
    height: 1
  }

  // EDIT: const parentShareDiff = genesisBlock.difficulty / (childsCount + 1)
  const parentShareDiff = genesisBlock.difficulty / childsCount
  const minimumDiff = 11801972029393 // konst
  const minimumDiffShare = minimumDiff / childsCount

  let newDifficulty = rambda.zip(previousChildTs, currentChildTs).reduce(([curr, prev], sum) => {
    return sum + getDiff(
      curr + blockBlocks,
      prev,
      parentShareDiff,
      minimumDiffShare
    )
  }, 0)

  const currentChildrenDifficulty = getDiff(
    (Date.now() * 1000) << 0,
    genesisBlock.timestamp,
    newDifficulty,
    minimumDiff,
    handicap
  )

  const newBlockDifficulty = getExpFactorDiff(currentChildrenDifficulty, genesisBlock.height)

  const [distance, nonce] = mine(
    work,
    '12312321', // Miner public address
    'dasdfsdaf', // New merkle root
    newBlockDifficulty / 11 // Zrychlovaci deleni
  )

  console.log(newBlockDifficulty, distance, nonce)
}

function split (t) {
  return t.split('').map((an) => {
    return an.charCodeAt(0)
  })
}

function dist (x, y, clbk) {
  let s
  if (arguments.length > 2) {
    s = similarity(x, y, clbk)
  } else {
    s = similarity(x, y)
  }
  return s !== null ? 1 - s : s
}

/**
 * FUNCTION: distance(a,b)
 *    Returns summed distances between two strings broken into of 8 bits
 *
 * @param {Hash} a
 * @param {Hash} b
 * @returns {Number}
 */
function distance (a, b) {
  const ac = _.chunk(split(a), 32)
  const bc = _.chunk(split(b), 32)

  const value = bc.reduce((all, bd, i) => {
    return all + dist(bd, ac.pop())
  }, 0)

  return Math.floor(value * 1000000000000000)
}

function mine (work, miner, merkleRoot, difficulty) /* -> dist, nonce */ {
  let result

  console.log('mining for threshold: ' + difficulty)

  while (true) {
    let nonce = String(Math.random()) // random string
    let nonceHash = blake(nonce)
    result = distance(work, blake(miner + merkleRoot + nonceHash))
    if (result > difficulty) {
      return [result, nonce] // [distance, nonce]
    }
  }
}

main()
