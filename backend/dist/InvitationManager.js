"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvitationManager = void 0;
class InvitationManager {
    constructor(gameManager) {
        this.invitations = {};
        this.gameManager = gameManager;
    }
    handleInvitation(data, player, onlinePlayers) {
        switch (data.type) {
            case "inviteFriend":
                this.sendInvitation(data, player, onlinePlayers);
                break;
            case "acceptInvite":
                this.acceptInvitation(data, player, onlinePlayers);
                break;
            default:
                player.send({ type: "error", message: "Invalid invitation type." });
        }
    }
    sendInvitation(data, player, onlinePlayers) {
        if (!data.friendId) {
            player.send({
                type: "error",
                message: "Friend ID is required to send an invitation.",
            });
            return;
        }
        const friend = onlinePlayers[data.friendId];
        if (!friend) {
            player.send({
                type: "error",
                message: `Friend with ID ${data.friendId} is not online.`,
            });
            return;
        }
        const timeLimit = 30000;
        const invitationId = `${player.id}-${data.friendId}`;
        friend.send({
            type: "invitation",
            from: player.id,
            message: "You have been invited to a game. Accept within 30 seconds.",
            invitationId,
        });
        this.invitations[invitationId] = setTimeout(() => {
            player.send({
                type: "error",
                message: `Your invitation to ${friend.id} has expired.`,
            });
            friend.send({
                type: "error",
                message: `Invitation from ${player.id} expired.`,
            });
            delete this.invitations[invitationId];
        }, timeLimit);
    }
    acceptInvitation(data, player, onlinePlayers) {
        if (!data.from) {
            player.send({
                type: "error",
                message: "Invitation sender ID is required to accept.",
            });
            return;
        }
        const inviter = onlinePlayers[data.from];
        if (!inviter) {
            player.send({
                type: "error",
                message: `Player with ID ${data.from} is not online.`,
            });
            return;
        }
        const gameId = this.gameManager.addGame(inviter, player);
        inviter.send({
            type: "startGame",
            gameId,
            color: "white",
            message: "Game started with your friend!",
        });
        player.send({
            type: "startGame",
            gameId,
            color: "black",
            message: "Game started with your friend!",
        });
        const invitationId = `${inviter.id}-${player.id}`;
        if (this.invitations[invitationId]) {
            clearTimeout(this.invitations[invitationId]);
            delete this.invitations[invitationId];
        }
    }
}
exports.InvitationManager = InvitationManager;