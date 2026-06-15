const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const config = require("../config/token");

const UsersState = {
  users: [],
  setUsers: function (newUsersArray) {
    this.users = newUsersArray;
  },
};

function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: "*", credentials: true },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      socket.user = { id: socket.id, name: "Guest", role: "guest" };
      return next();
    }

    try {
      socket.user = jwt.verify(token, config.accessSecret);
      return next();
    } catch {
      socket.user = { id: socket.id, name: "Guest", role: "guest" };
      return next();
    }
  });

  io.on("connection", (socket) => {
    console.log(`[Socket] Подключился: ${socket.user.name}`);

    if (socket.user?.role !== "guest") {
      socket.join(`user:${socket.user.id}`);
    }

    socket.emit("message", buildMsg("System", `Welcome ${socket.user.name}!`));

    socket.on("enterRoom", ({ name, room }) => {
      if (!room) return;

      const userName = name || socket.user?.name || "Guest";
      const prevRoom = getUser(socket.id)?.room;

      if (prevRoom) {
        socket.leave(prevRoom);
        io.to(prevRoom).emit(
          "message",
          buildMsg("System", `${userName} has left the room`),
        );
      }

      const user = activateUser(socket.id, userName, room);

      if (prevRoom) {
        io.to(prevRoom).emit("userList", {
          users: getUsersInRoom(prevRoom),
        });
      }

      socket.join(user.room);
      socket.emit(
        "message",
        buildMsg("System", `You have joined the ${user.room} chat room`),
      );
      socket.broadcast
        .to(user.room)
        .emit(
          "message",
          buildMsg("System", `${user.name} has joined the room`),
        );
      io.to(user.room).emit("userList", {
        users: getUsersInRoom(user.room),
      });
      io.emit("roomList", {
        rooms: getAllActiveRooms(),
      });
    });

    socket.on("message", ({ name, text }) => {
      const room = getUser(socket.id)?.room;
      if (room) {
        io.to(room).emit("message", buildMsg(name, text));
      }
    });

    socket.on("activity", (name) => {
      const room = getUser(socket.id)?.room;
      if (room) {
        socket.broadcast.to(room).emit("activity", name);
      }
    });

    socket.on("disconnect", () => {
      const user = getUser(socket.id);
      userLeavesApp(socket.id);
      if (user) {
        io.to(user.room).emit(
          "message",
          buildMsg("System", `${user.name} has left the room`),
        );
        io.to(user.room).emit("userList", {
          users: getUsersInRoom(user.room),
        });
        io.emit("roomList", {
          rooms: getAllActiveRooms(),
        });
      }
      console.log(`[Socket] Отключился: ${socket.user.name}`);
    });
  });

  return io;
}

function buildMsg(name, text) {
  return {
    name,
    text,
    time: new Intl.DateTimeFormat("default", {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    }).format(new Date()),
  };
}

function activateUser(id, name, room) {
  const user = { id, name, room };
  UsersState.setUsers([
    ...UsersState.users.filter((user) => user.id !== id),
    user,
  ]);
  return user;
}

function userLeavesApp(id) {
  UsersState.setUsers(UsersState.users.filter((user) => user.id !== id));
}

function getUser(id) {
  return UsersState.users.find((user) => user.id === id);
}

function getUsersInRoom(room) {
  return UsersState.users.filter((user) => user.room === room);
}

function getAllActiveRooms() {
  return Array.from(new Set(UsersState.users.map((user) => user.room)));
}

module.exports = { initSocket };
