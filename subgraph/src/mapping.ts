import { BigInt } from "@graphprotocol/graph-ts"
import {
  PlayerRegistered,
  GameCreated,
  GameJoined,
  MoveMade,
  GameFinished
} from "../generated/StacksTacToe/StacksTacToe"
import { Player, Game, Move } from "../generated/schema"

export function handlePlayerRegistered(event: PlayerRegistered): void {
  let id = event.params.player.toHex()
  let player = Player.load(id)
  if (!player) {
    player = new Player(id)
    player.address = event.params.player
    player.wins = BigInt.fromI32(0)
    player.draws = BigInt.fromI32(0)
    player.rating = BigInt.fromI32(1000)
  }
  player.username = event.params.username
  player.save()
}

export function handleGameCreated(event: GameCreated): void {
  let id = event.params.gameId.toString()
  let game = new Game(id)
  game.player1 = event.params.creator.toHex()
  game.boardSize = event.params.boardSize
  game.betAmount = event.params.betAmount
  game.status = "WAITING"
  game.createdAt = event.block.timestamp
  game.updatedAt = event.block.timestamp
  game.save()
}

export function handleGameJoined(event: GameJoined): void {
  let id = event.params.gameId.toString()
  let game = Game.load(id)
  if (game) {
    game.player2 = event.params.joiner.toHex()
    game.status = "ACTIVE"
    game.updatedAt = event.block.timestamp
    game.save()
  }
}

export function handleMoveMade(event: MoveMade): void {
  let moveId = event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  let move = new Move(moveId)
  move.game = event.params.gameId.toString()
  move.player = event.params.player.toHex()
  move.position = event.params.position
  move.timestamp = event.block.timestamp
  move.save()

  let game = Game.load(event.params.gameId.toString())
  if (game) {
    game.updatedAt = event.block.timestamp
    game.save()
  }
}

export function handleGameFinished(event: GameFinished): void {
  let id = event.params.gameId.toString()
  let game = Game.load(id)
  if (game) {
    game.status = "FINISHED"
    game.updatedAt = event.block.timestamp
    
    if (event.params.outcome == "WIN") {
      game.winner = event.params.winner.toHex()
      let player = Player.load(event.params.winner.toHex())
      if (player) {
        player.wins = player.wins.plus(BigInt.fromI32(1))
        player.save()
      }
    } else if (event.params.outcome == "DRAW") {
      let player1 = Player.load(game.player1)
      if (player1) {
        player1.draws = player1.draws.plus(BigInt.fromI32(1))
        player1.save()
      }
      if (game.player2) {
        let player2 = Player.load(game.player2!)
        if (player2) {
          player2.draws = player2.draws.plus(BigInt.fromI32(1))
          player2.save()
        }
      }
    }
    game.save()
  }
}
