const socketIO = require("socket.io");
const socketioJwt = require('socketio-jwt');
const jwt = require("jsonwebtoken")
const {db} = require("./firebase")
const {FieldValue} = require("firebase-admin/firestore")

const configureSocketServer = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: ['localhost:3000', 'http://127.0.0.1:5173', 'http://localhost:5173'],
      methods: ["GET", "POST"]
    },
    serveClient: false,
  });
  const userSocketMap = new Map();
  
  /*io.use(socketioJwt.authorize({
    secret: process.env.TOKEN_SECRET,
    handshake: true,
    callback: true,
  }));*/

  // Function to add a user's socket connection to the mapping
  const addUserSocket = (userId, socket) => {
    userSocketMap.set(userId, socket);
  };

  // Function to remove a user's socket connection from the mapping
  const removeUserSocket = (userId) => {
    userSocketMap.delete(userId);
  };

  // Function to retrieve a friend's socket connection based on their user ID
  const getFriendSocket = (friendId) => {
    return userSocketMap.get(friendId);
  };

  /*io.use((socket, next) => {
      // Implement your authentication logic here
      // Check if the user is logged in based on the request or socket information
      if (socket.request.headers.authorization) {
        // User is logged in, allow the socket connection
        return next();
      }
      
      // User is not logged in, reject the socket connection
      return next(new Error("Unauthorized"));
    });*/
    io.use((socket, next) => {
      // Extract the token from the authentication data sent by the client
      const token = socket.handshake.auth.token;
    
      // Verify and decode the token
      jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
        if (err) {
          // Token verification failed
          return next(new Error('Authentication error'));
        }
    
        // Token verification succeeded, extract user information
        const user = decoded.userId;
        // Attach the user object to the socket for future use
        socket.user = user;
    
        // Call the next middleware
        next();
      });
    });
  io.on("connection", (socket) => {
    console.log("A user connected");
    socket.emit("me", socket.id)
    const user = socket.user
    addUserSocket(user,socket)
    console.log("userSocketMap", userSocketMap)
    //const req = socket.request.req;
    //const userName = req.userName;
    //console.log("userName", userName)
    socket.on('startChat', (friendId) => {
      console.log("friendId", friendId)
      // Handle chat initiation logic
      // Find the corresponding socket connection for the friend's user ID
      const friendSocket = getFriendSocket(friendId.userName);
      if (friendSocket) {
        console.log("chat initiated in backednd" )
        // Emit custom event to the friend's socket connection
        friendSocket.emit('chatInitiated', { message: 'Chat initiated!' });
      }else {

        console.log("friendSocket does not exist")
      }
    });


    socket.on("cameraOn", data => {
      const friendSocket = getFriendSocket(data);
      if(friendSocket){
        console.log("friendSocket exists")
        console.log("data", data)
        friendSocket.emit("cameraOn")
      }
    })
    socket.on("cameraOff", data => {
      const friendSocket = getFriendSocket(data);
      if(friendSocket){
        console.log("friendSocket exists")
        console.log("data", data)
        friendSocket.emit("cameraOff")
      }
    })
    socket.on("micOn", data => {
      const friendSocket = getFriendSocket(data);
      if(friendSocket){
        console.log("friendSocket exists")
        console.log("data", data)
        friendSocket.emit("micOn")
      }
    })
    socket.on("micOff", data => {
      const friendSocket = getFriendSocket(data);
      if(friendSocket){
        console.log("friendSocket exists")
        console.log("data", data)
        friendSocket.emit("micOff")
      }
    })
    socket.on("liked", async (data) => {
      const friendSocket = getFriendSocket(data.userId);
      if(friendSocket){
        console.log("friendSocket exists")
        console.log("data", data)
        friendSocket.emit("liked", (data.myId))
      }
        try {
          const userRef = db.collection('users').where('userName', '==', data.userId).limit(1);
      const userSnapshot = await userRef.get();
      
      if (userSnapshot.empty) {
        console.log('No such documeasasasdsadasdsdant!');
      } else {
        const userDoc = userSnapshot.docs[0];
        const userData = userDoc.data()
        let notifications = userData.notifications
        notifications = [{message:` liked your profile`, from: socket.user}, ...notifications]
        await userDoc.ref.update({notifications: notifications})
      }
        }catch(err){
          console.log(err)
        }

    })

    socket.on("giftSent", async (data) => {
      const friendSocket = getFriendSocket(data);
      if(friendSocket){
        console.log("friendSocket exists")
        console.log("data", data)
        friendSocket.emit("giftSent", (socket.user))
      }
        try {
          const userRef = db.collection('users').where('userName', '==', data).limit(1);
      const userSnapshot = await userRef.get();
      
      if (userSnapshot.empty) {
        console.log('No such documeasasasdsadasdsdant!');
      } else {
        const userDoc = userSnapshot.docs[0];
        const userData = userDoc.data()
        let notifications = userData.notifications
        notifications = [{message : ' sent u a gift!', from: socket.user}, ...notifications]
        await userDoc.ref.update({notifications: notifications})
      }
        }catch(err){
          console.log(err)
        }
      
    })

    socket.on("chat message", (msg) => {
      console.log("Received message:", msg);
      // Process and handle the message as needed
      // You can emit events back to the client or broadcast messages to other connected clients
    });
    socket.on('message', (message) => {
      socket.emit('message', message);
    });
    socket.on("callUser", (data) => {
    
      const friendSocket = getFriendSocket(data.userToCall);
      if(friendSocket){
        console.log("friendSocket exists")
        console.log("data", data)
        friendSocket.emit("callUser", { signal: data.signalData, from: data.from, name: data.name })
      }else{
        socket.emit("error", {message: "user is offline", data: data, event: "callUser"  })
      }
    })
    socket.on("leaveCall", (to)=> {
      const friendSocket = getFriendSocket(to);
      if(friendSocket){
        console.log("friendSocket exists")
        console.log("data", to)
        friendSocket.emit("leaveCall")
  }})
    socket.on("declined",(data) => {
      const friendSocket = getFriendSocket(data);
      if(friendSocket){
        console.log("friendSocket exists")
       
        friendSocket.emit("declined")
  }
  console.log("deosnt exist")
    })

    socket.on("autodecline", (data) => {
      const friendSocket = getFriendSocket(data);
      if(friendSocket){
        console.log("friendSocket exists")
       
        friendSocket.emit("autodecline")
  }
  console.log("deosnt exist")
    })

    socket.on("answerCall", async (data) => {

      try {
        const userRef = db.collection('users');
        const snapshot = await userRef.where('userName', '==', data.to).limit(1).get();
        if (snapshot.empty) {
          console.log('No matching documents.');
        } 
        
          const userDoc = snapshot.docs[0];
          const user = userDoc.data()
          const newTokens = user.tokens - 50
          await userDoc.ref.update({ ...user, tokens: newTokens });
        }catch(e){
          console.log(e)
        }
      const reqSocket = getFriendSocket(data.to)
      reqSocket.emit("callAccepted", data.signal)
    })

    
    socket.on("cancelCall", (data) => {
      const reqSocket = getFriendSocket(data)
      if(reqSocket){
        reqSocket.emit("cancelCall")
      }
    })

    socket.on('privateMessage', async ({ friend, message }) => {
      const timestamp = Date.now()
      const date = new Date(timestamp)
      const firebaseDate = date.toISOString()
      // Find the friend's socket and emit the private message
      const friendSocket = getFriendSocket(friend.userName)
      if (friendSocket) {
        console.log("friend socket exists when sending messages")
        friendSocket.emit('privateMessage', {message:{message, from: "friend", at: firebaseDate}, userName: socket.user});
      }else{
        try {
        const userRef = db.collection('users');
        const snapshot = await userRef.where('userName', '==', friend.userName).limit(1).get();
        if (snapshot.empty) {
          console.log('No matching documents.');
        } 
        
          const userDoc = snapshot.docs[0];
          const notifications  = userDoc.data().messageNotifications
          const newNotifications = [socket.user, ...notifications]
          await userDoc.ref.update({ messageNotifications: newNotifications });
        }catch(e){
          console.log(e)
        }
      }
      try {
        const userRef = db.collection('users');
        const snapshot = await userRef.where('userName', '==', socket.user).limit(1).get();
        if (snapshot.empty) {
          console.log('No matching documents.');
        
        } 
        
          const userDoc = snapshot.docs[0];
          const friendList  = userDoc.data().friendList 
          const user = userDoc.data()
          const newTokens = user.tokens -5
        const friendIndex = friendList.findIndex(f => f.userName === friend.userName);
    if (friendIndex !== -1) {
      // Append the new message to the friend's messages array
      friendList[friendIndex].messages.push({message, from: "me", at: firebaseDate});

      // Update the friendList array in the user document
      await userDoc.ref.update({ friendList, tokens: newTokens});

      console.log('Message added to friendList successfully');
    } else {
      console.log('Friend not found in the friendList');
    }
      }catch(error){
       console.log("errorrrrrr", error)
      }


      try {
        const userRef = db.collection('users');
        const snapshot = await userRef.where('userName', '==', friend.userName).limit(1).get();
        if (snapshot.empty) {
          console.log('No matching documents.');
        } 
        
          const userDoc = snapshot.docs[0];
          const friendList  = userDoc.data().friendList 

        const friendIndex = friendList.findIndex(f => f.userName === socket.user);
    if (friendIndex !== -1) {
      
      // Append the new message to the friend's messages array
      friendList[friendIndex].messages.push({message, from: "friend", at: firebaseDate});

      // Update the friendList array in the user document
      await userDoc.ref.update({ friendList });

      console.log('Message added to friendList successfully');
    } else {
      console.log('Friend not found in the friendList');
    }
      }catch(error){
       console.log("errorrrrrr", error)
      }

      console.log("message", message)
      console.log("socket.user", socket.user)
      console.log("friend", friend.userName)
      
    });

    socket.on('sendImage', async ({data, friend, id, downloadLink} ) => {
      // Process and save the image data on the server
     console.log("something received")
     const friendSocket = getFriendSocket(friend.userName)
      
        const timestamp = Date.now()
            const date = new Date(timestamp)
            const firebaseDate = date.toISOString()
        try {
          const userRef = db.collection('users');
          const snapshot = await userRef.where('userName', '==', socket.user).limit(1).get();
          if (snapshot.empty) {
            console.log('No matching documents.');
          } 
          
            const userDoc = snapshot.docs[0];

            const friendList  = userDoc.data().friendList 
            const newTokens = userDoc.data().tokens - 5
        const friendIndex = friendList.findIndex(f => f.userName === friend.userName);
    if (friendIndex !== -1) {
      
      // Append the new message to the friend's messages array
      friendList[friendIndex].messages.push({message: data, from: "me", at: firebaseDate, image: true, id: id, blured: false});
console.log("friendLISSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSST" ,friendList)
      // Update the friendList array in the user document
      await userDoc.ref.update({ friendList: friendList , tokens: newTokens});

      console.log('Message added to friendList successfully');
    } else {
      console.log('Friend not found in the friendList');
    }
        }catch(error){
         console.log("errorrrrrr", error)
        }
      


      //////////////////////////////////////

      try {
        const userRef = db.collection('users');
        const snapshot = await userRef.where('userName', '==', friend.userName).limit(1).get();
        if (snapshot.empty) {
          console.log('No matching documents.');
        } 
        const timestamp = Date.now()
            const date = new Date(timestamp)
            const firebaseDate = date.toISOString()
          const userDoc = snapshot.docs[0];
          const friendList  = userDoc.data().friendList 
          await userDoc.ref.update({ photos: FieldValue.arrayUnion({from: friend.userName, url: data, id: id, blured: true}) });
        const friendIndex = friendList.findIndex(f => f.userName === socket.user);
    if (friendIndex !== -1) {
      
      // Append the new message to the friend's messages array
      friendList[friendIndex].messages.push({message: data, from: "friend", at: firebaseDate, image: true, id: id, blured: true, downloadLink: downloadLink});

      // Update the friendList array in the user document
      await userDoc.ref.update({ friendList: friendList });

      console.log('Message added to friendList successfully');
    } else {
      console.log('Friend not found in the friendList');
    }
      }catch(error){
       console.log("errorrrrrr", error)
      }

      if (friendSocket) {
        friendSocket.emit('receiveImage', {message: data, at : firebaseDate, from: "friend", id: id, image: true, blured: true, downloadLink: downloadLink});

      }else{
        try {
          const userRef = db.collection('users');
          const snapshot = await userRef.where('userName', '==', friend.userName).limit(1).get();
          if (snapshot.empty) {
            console.log('No matching documents.');
          } 
          
            const userDoc = snapshot.docs[0];
            const notifications  = userDoc.data().messageNotifications
            const newNotifications = [socket.user, ...notifications]
            await userDoc.ref.update({ messageNotifications: newNotifications });
          }catch(e){
            console.log(e)
          }
      }
      // Broadcast the image to other connected clients
      
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected");
      userSocketMap.delete(socket.user)
    });
  });
};

module.exports = configureSocketServer;