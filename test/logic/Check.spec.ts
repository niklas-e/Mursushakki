import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import factory from "./CheckFactory";
import {moveSequence} from "./BoardHelper";
chai.should();
chai.use(chaiAsPromised);

describe("Check", () => {
    describe("Basics", () => {
        it("should check", done => {
            const promise = factory.build("board-check")
                .then(board => moveSequence(board, [["b3", "b1"]]));
            promise.should.eventually.have.same.members(["move|check"]).notify(done);
        });
        it("should not allow king to move into check", done => {
            const promise = factory.build("board-check")
                .then(board => moveSequence(board, [["c1", "b1"]]));
            promise.should.eventually.have.same.members(["error"]).notify(done);
        });
        it("should not allow king to move from check to check", done => {
            const promise = factory.build("board-check")
                .then(board => moveSequence(board, [["b3", "b1"], ["c1", "d1"]]));
            promise.should.eventually.have.same.members(["move|check", "error"]).notify(done);
        });
        it("should allow king to capture checking piece", done => {
            const promise = factory.build("board-check")
                .then(board => moveSequence(board, [["b3", "b1"], ["c1", "b1"]]));
            promise.should.eventually.have.same.members(["move|check", "capture"]).notify(done);
        });
    }),
    describe("King in check", () => {
        it("should not allow king to capture checking piece if it causes check", done => {
            const promise = factory.build("board-king-in-check")
                .then(board => moveSequence(board, [["d1", "c1"]]));
            promise.should.eventually.have.same.members(["error"]).notify(done);
        });

        it("should not allow other pieces to move if king is in check", done => {
            const promise = factory.build("board-king-in-check")
                .then(board => moveSequence(board, [["a1", "a8"]]));
            promise.should.eventually.have.same.members(["error"]).notify(done);
        });

        it("should allow other pieces to capture checking piece", done => {
            const promise = factory.build("board-king-in-check")
                .then(board => moveSequence(board, [["a1", "b1"]]));
            promise.should.eventually.have.same.members(["error"]).notify(done);
        });
    }),
    describe("Ohter pieces causing check", () => {
        it("Should not allow other pieces moving to cause check", done => {
            const promise = factory.build("board-check-from-own-move")
                .then(board => moveSequence(board, [["c1", "c8"]]));
            promise.should.eventually.have.same.members(["error"]).notify(done);
        });
    })
    describe("Enpassant causes check", () => {
        it("should be able to check with enpassant", done => {
            const promise = factory.build("board-check-enpassant")
                .then(board => moveSequence(board, [["a7", "a5"], ["b5", "a6"]]));
            promise.should.eventually.have.same.members(["move", "enpassant|check"]).notify(done);
        })
    })
    describe("Castling causes check", () => {
        it("should be able to check with castling", done => {
            const promise = factory.build("board-check-castling")
                .then(board => moveSequence(board, [["e1", "c1"]]));
            promise.should.eventually.have.same.members(["castling|check"]).notify(done);
        })
    })
});
