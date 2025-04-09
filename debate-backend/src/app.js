const express = require("express");
const cors = require("cors");
const logger = require("morgan");
require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const { PrismaClient } = require("@prisma/client");

const app = express();
const PORT = process.env.PORT || 8000;
const prisma = new PrismaClient();

app.use(cors({ origin: "*", credentials: true, optionsSuccessStatus: 202 }));
app.use(express.json({ limit: "10mb" }));
app.use(logger("dev"));

const routes = require("./routes");
app.use("/api", routes);

app.use((req, res) => {
  return res.status(404).send({ message: "Route not found" });
});

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("joinDebate", (debateId) => {
    socket.join(debateId);
    console.log(`Socket ${socket.id} joined debate ${debateId}`);
  });

  // CREATE contribution and broadcast.
  socket.on("sendContribution", async (data, callback) => {
    console.log("sendContribution data:", data);
    try {
      const { debateId, authorName, authorId, side, content } = data;
      const contribution = await prisma.contribution.create({
        data: { debateId, authorName, authorId, side, content },
      });
      io.to(debateId).emit("newContribution", contribution);
      if (callback) callback({ status: "ok" });
    } catch (error) {
      console.error("Error creating contribution:", error);
      if (callback) callback({ status: "error", error: error.message });
    }
  });

  // REACT to a contribution.
  socket.on("reactContribution", async (data) => {
    try {
      const contribution = await prisma.contribution.findUnique({
        where: { id: data.contributionId },
      });
      if (!contribution) return socket.emit("error", "Contribution not found");
      let updateData = {};
      if (data.reaction === "like") {
        updateData = { likes: contribution.likes + 1 };
      } else if (data.reaction === "dislike") {
        updateData = { dislikes: contribution.dislikes + 1 };
      } else {
        return socket.emit("error", "Invalid reaction");
      }
      const updated = await prisma.contribution.update({
        where: { id: data.contributionId },
        data: updateData,
      });
      io.to(data.debateId).emit("updateContribution", updated);
    } catch (error) {
      console.error(error);
      socket.emit("error", "Failed to update reaction");
    }
  });

  socket.on("awardContribution", async (data, callback) => {
    console.log("awardContribution data:", data);
    try {
      const contribution = await prisma.contribution.findUnique({
        where: { id: data.contributionId },
      });
      if (!contribution) {
        if (typeof callback === "function") callback("Contribution not found");
        return socket.emit("error", "Contribution not found");
      }
      const updated = await prisma.contribution.update({
        where: { id: data.contributionId },
        data: { awards: { push: data.award } },
      });
      io.to(data.debateId).emit("updateContribution", updated);
      if (typeof callback === "function") callback(null, updated);
    } catch (error) {
      console.error(error);
      if (typeof callback === "function") callback("Failed to award contribution");
      socket.emit("error", "Failed to award contribution");
    }
  });

  socket.on("removeUser", async (data, callback) => {
    console.log("removeUser data:", data);
    try {
      const debate = await prisma.debate.findUnique({
        where: { id: data.debateId },
      });
      if (!debate) {
        if (typeof callback === "function") callback("Debate not found");
        return socket.emit("error", "Debate not found");
      }
      const updated = await prisma.debate.update({
        where: { id: data.debateId },
        data: { removeUsers: { push: data.userId } },
        include: { contributions: true, participants: true },
      });
      io.to(data.debateId).emit("updateDebate", updated);
      if (typeof callback === "function") callback(null, updated);
    } catch (error) {
      console.error(error);
      if (typeof callback === "function") callback("Failed to remove user");
      socket.emit("error", "Failed to remove user");
    }
  });

  // Raise hand event: a student sends a raise hand request.
  socket.on("raiseHand", async (data, callback) => {
    try {
      const existing = await prisma.raiseHand.findFirst({
        where: { debateId: data.debateId, authorId: data.authorId },
      });
      if (existing) {
        return callback && callback({ status: "alreadyRaised", raiseHand: existing });
      }
      const raiseHandRecord = await prisma.raiseHand.create({
        data: { debateId: data.debateId, authorId: data.authorId },
        include: { author: true },
      });
      io.to(data.debateId).emit("newRaiseHand", raiseHandRecord);
      if (callback) callback({ status: "ok", raiseHand: raiseHandRecord });
    } catch (error) {
      console.error("Error handling raise hand:", error);
      if (callback) callback({ status: "error", error: error.message });
    }
  });

  // Teacher approves a raised hand.
  socket.on("approveSpeak", async (data, callback) => {
    try {
      const updatedRaiseHand = await prisma.raiseHand.update({
        where: { id: data.raiseHandId },
        data: { isSelected: true },
        include: { author: true },
      });
      io.to(data.debateId).emit("updateRaiseHand", updatedRaiseHand);
      if (callback) callback({ status: "ok", raiseHand: updatedRaiseHand });
    } catch (error) {
      console.error("Error approving speak:", error);
      if (callback) callback({ status: "error", error: error.message });
    }
  });

  // Clear (or revoke) the raised hand (can be called by student or teacher).
  socket.on("clearRaiseHand", async (data, callback) => {
    console.log("clearRaiseHand data:", data);
    try {
      await prisma.raiseHand.delete({
        where: { id: data.raiseHandId },
      });
      // Emit an object containing raiseHandId so all clients can remove it.
      io.to(data.debateId).emit("removeRaiseHand", { raiseHandId: data.raiseHandId });
      if (callback) callback({ status: "ok" });
    } catch (error) {
      console.error("Error clearing raise hand:", error);
      if (callback) callback({ status: "error", error: error.message });
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
