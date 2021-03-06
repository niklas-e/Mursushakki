import socketIO from "socket.io-client"
import { observable, action } from "mobx";
import * as Majavashakki from "../../common/GamePieces"
import GameEntity from "../../server/entities/Game"
import BoardModel from "./Board";
import ApiService from "../common/ApiService";
import GameBase from "../../common/GameBase";

// TODO: Extend /src/common/Game
export default class Game extends GameBase {
  @observable
  public title: string
  @observable
  public currentTurn: Majavashakki.PieceColor

  @observable
  public isLoading: boolean
  @observable
  public currentUser: global.IUserContract
  @observable
  public error: string
  @observable
  public isCheck: boolean
  @observable
  public isCheckmate: boolean

  public board: BoardModel
  private socket: SocketIOClient.Socket
  private gameId: string

  constructor(title: string) {
    super(title);
    this.isLoading = true
  }

  @action
  public loadGame = async (gameId: string) => {
    this.isLoading = true

    this.currentUser = await ApiService.read.user();
    const gameEntity = await ApiService.read.game(gameId);

    const game = GameEntity.MapFromDb(gameEntity)
    this.title = game.title
    this.gameId = gameId
    this.currentTurn = game.currentTurn
    this.playerIdBlack = game.playerIdBlack
    this.playerIdWhite = game.playerIdWhite
    this.board = new BoardModel(game.board.pieces, game.board.moveHistory)
    this.isCheck = gameEntity.isCheck
    this.isCheckmate = gameEntity.isCheckmate

    this.isLoading = false
  }

  public connectSocket = () => {
    this.socket = socketIO()
    this.socket.on("move_result", this.onMoveResult)
  }

  @action
  public async move(start: Majavashakki.IPosition, destination: Majavashakki.IPosition, userId: string = this.currentUser.id): Promise<Majavashakki.IMoveResponse> {
    const result = await super.move(start, destination, userId);

    if (result.status === Majavashakki.MoveStatus.Success) {
      await ApiService.write.makeMove(this.gameId, start, destination)
    } else {
      this.error = result.error
    }

    return result;
  }

  ///
  // Socket methods
  ///

  @action
  private onMoveResult = (move: Majavashakki.IMoveResponse) => {
    if (move.status === Majavashakki.MoveStatus.Success) {
      this.board.move(move.start, move.destination)
      this.error = ""
      this.changeTurn()
      this.isCheck = move.isCheck
      this.isCheckmate = move.isCheckmate
    } else {
      this.error = move.error
    }
  }
}