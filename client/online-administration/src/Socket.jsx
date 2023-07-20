import io from "socket.io-client";

const Socket = io(import.meta.env.VITE_SERVER_URL, {
  auth: {
    token: localStorage.getItem("token")
  },
  transport: WebSocket,
});

export default Socket;