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
const io = new Server(server, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("joinDebate", (debateId) => {
    socket.join(debateId);
    console.log(`Socket ${socket.id} joined debate ${debateId}`);
  });

  // CREATE contribution and broadcast
  socket.on("sendContribution", async (data, callback) => {
    console.log("🚀 ~ socket.on('sendContribution') data:", data);
    try {
      const { debateId, authorName, authorId, side, content } = data;

      const contribution = await prisma.contribution.create({
        data: { debateId, authorName, authorId, side, content },
      });

      // Broadcast the newly created contribution to everyone in that debate room
      io.to(debateId).emit("newContribution", contribution);

      // Let the client know we succeeded
      if (callback) {
        callback({ status: "ok" });
      }
    } catch (error) {
      console.error("Error creating contribution:", error);
      if (callback) {
        callback({ status: "error", error: error.message });
      }
    }
  });

  // REACT to a contribution
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
    console.log("🚀 ~ socket.on ~ data:", data);
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
      console.log("🚀 ~ socket.on ~ updated:", updated);

      io.to(data.debateId).emit("updateContribution", updated);

      if (typeof callback === "function") callback(null, updated);
    } catch (error) {
      console.error(error);
      if (typeof callback === "function") callback("Failed to award contribution");
      socket.emit("error", "Failed to award contribution");
    }
  });

  socket.on("removeUser", async (data, callback) => {
    console.log("🚀 ~ socket.on ~ removeUser data:", data);
    try {
      // First, find the debate to ensure it exists
      const debate = await prisma.debate.findUnique({
        where: { id: data.debateId },
      });
      console.log("🚀 ~ socket.on ~ debate:", debate)
      if (!debate) {
        if (typeof callback === "function") callback("Debate not found");
        return socket.emit("error", "Debate not found");
      }

      // Update the debate by pushing the user ID into removeUsers array
      const updated = await prisma.debate.update({
        where: { id: data.debateId },
        data: { removeUsers: { push: data.userId } },
        include:{contributions:true,participants:true}
      });
      console.log("🚀 ~ socket.on ~ updated debate:", updated);

      // Emit the updated debate data to all clients connected to this debate room
      io.to(data.debateId).emit("updateDebate", updated);

      if (typeof callback === "function") callback(null, updated);
    } catch (error) {
      console.error(error);
      if (typeof callback === "function") callback("Failed to remove user");
      socket.emit("error", "Failed to remove user");
    }
  });


  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
