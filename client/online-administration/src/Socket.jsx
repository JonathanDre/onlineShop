import io from "socket.io-client";

const Socket = io("http://localhost:3000", {
  auth: {
    token: localStorage.getItem("token")
  },
  transport: WebSocket,
});

export default Socket;