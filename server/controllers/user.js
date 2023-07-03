const {db} =  require("./../firebase.js")
const jwt = require("jsonwebtoken")
const {FieldValue} = require("firebase-admin/firestore")

const home = async function( req, res ){
  const usersRef = db.collection('users');
  const users = []
  await usersRef.where('gender', '==', "Female")
  .get()
  .then((querySnapshot) =>{
    if (!querySnapshot.empty) {
      querySnapshot.docs.forEach((document)=>{
        users.push(document.data())
      })
      const data = { users};
      res.status(200).json(data)
    } else {
      res.status(404).json({"message":"not found"})
    }
  }).catch(err => {
    res.status(500).json({ erros: err });
  });
}

const about = async function(req, res){
  try {
    const email = req.user; // Access the user email from req.user
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).limit(1).get();
    
    if (snapshot.empty) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = snapshot.docs[0].data();
    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
    // Fetch the user's information from your database using userId
}

const currentUser = async (req, res) =>{
  try {
    const email = req.user;
    const userRef = db.collection('users');
    const docSnap = await userRef.where('email', '==', email).limit(1).get();
  
    if (!docSnap.empty) {
      const userDoc = docSnap.docs[0];
      const user = userDoc.data();
      res.status(200).json(user);
      
    } else {
      console.log("in th error")
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(401).json({
      error: {
        name: error.name,
        message: error.message
      }
    });
  }
}

const updateUnlockPhoto = async (req, res) => {
  try {
  const email = req.user;
  const id = req.body.id
  const from = req.body.from
  const price = req.body.price
  const userRef = db.collection('users');
  const docSnap = await userRef.where('email', '==', email).limit(1).get();

  if (!docSnap.empty) {
    const userDoc = docSnap.docs[0];
    const user = userDoc.data();
    const tokens = user.tokens
    if (tokens == 0 ){
      res.status(400).json({message: "not enought tokens"})
    }
    const photoIndex = user.photos.findIndex(photo => photo.id === id);
    const friendList  = user.friendList 
    const friendIndex = friendList.findIndex(f => f.userName === from);
      if(price < tokens){
        if (photoIndex !== -1 && friendIndex !== -1) {
          // Update the property of the photo object
          const filteredNotImages = friendList[friendIndex].messages.filter( f => !f.image)
          const filteredImages = friendList[friendIndex].messages.filter( f => f.image)
          const message = filteredImages.find( f => f.id = id)
          if(message){
          message.blured = false
          const filteredFriendList = friendList[friendIndex].messages.filter( f => f !== message)
          filteredFriendList.push(message)

            user.photos[photoIndex].blured = false;
            photos = user.photos
            const newTokens = tokens - price 
            user.tokens = newTokens
            const newUserTokens = user.tokens
          // Update the user document in Firebase Firestore with the modified photo
          await userDoc.ref.update({ photos, tokens: newUserTokens  });
          await userDoc.ref.update({ friendList: friendList });
          
          res.status(200).json({id: id});
        }
        }else{
          res.status(404).json({message: "no such photo exists"})
        }
      }else {
        res.status(400).json({message: "not enought tokens"})
      }
  } else {
    console.log("in th error")
    res.status(404).json({ message: "User not found" });
  }
} catch (error) {
  res.status(401).json({
    error: {
      name: error.name,
      message: error.message
    }
  });
}
}

const oneUserProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    const userRef = db.collection('users').doc(userId);
    const docSnap = await userRef.get();

    if (docSnap.exists) {
      const user = docSnap.data();
      res.status(200).json({ user });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}



const updateUser = async (req, res) => {
  const email = req.user
  const urlList = req.body.urls
  console.log("urlList", urlList)
  const mainUrl = req.body.mainUrl
  try {
  const userRef = db.collection('users')
    const docSnap = await userRef.where('email', '==', email).limit(1).get();
    if (!docSnap.empty) {
      const userDoc = docSnap.docs[0];
      const user = userDoc.data();
      console.log("user1", user);
      if(user.mainImage.id){
        await userDoc.ref.update({ images: urlList});
        res.status(200).json({ message: 'images updated' });
      }else if (user.images.length === 0 && !user.mainImage.id){
        await userDoc.ref.update({ images: urlList, mainImage: mainUrl });
        res.status(200).json({ message: 'Main updated' });
        
      }else{

        const filteredImages = urlList.filter(f => f.id !== mainUrl.id)
        await userDoc.ref.update({ images: filteredImages, mainImage: mainUrl });
        res.status(200).json({ message: 'Main updated' });
      } 

    
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch(err){
    console.log(err)
  }
}

const updateLike = async (req, res) => {
  const userName = req.userName
  const userToUpdate = req.body.userId
console.log("userName", userName)
console.log("userToUpdate", userToUpdate)
  try {
    const userRef = db.collection('users')
    const docSnap = await userRef.where('userName', '==', userName).limit(1).get();
    const userToUpdateRef = db.collection('users')
    const docToUpdateSnap = await userToUpdateRef.where('userName', '==', userToUpdate).limit(1).get();
    
    if (!docSnap.empty && !docToUpdateSnap.empty) {
      const userDoc = docSnap.docs[0];
      const user = userDoc.data();

      const userToUpdateDoc = docToUpdateSnap.docs[0]
      const otherUser = userToUpdateDoc.data()
      
      if(user.usersLiked.includes(userToUpdate)){
        const newUsersLiked = user.usersLiked.filter((likedUser) => likedUser !== userToUpdate)
        console.log("newUsersLiked",newUsersLiked)
        await userDoc.ref.update({ usersLiked: newUsersLiked});
  
      }else{
        const newUsersLiked = [...user.usersLiked, userToUpdate]
        console.log("newUsersLiked",newUsersLiked)
        await userDoc.ref.update({ usersLiked: newUsersLiked});
      }

      if(otherUser.likedBy.includes(userName)){
        const newUsersLiked = otherUser.usersLiked.filter((likedUser) => likedUser !== userName)
        await userToUpdateDoc.ref.update({ likedBy: newUsersLiked});
      }else{
        const newUsersLiked = [...otherUser.usersLiked, userName]
        await userToUpdateDoc.ref.update({ likedBy: newUsersLiked});
      }
      res.status(200).json({ message: 'User added' });
    
    } else {
      res.status(404).json({ message: 'Users not found' });
    }
  }catch(err){
      console.log(err)
  }
}

const updateUserBalance = async (req, res) => {
  const email = req.user
  const { balance } = req.body
  try {
    const userRef = db.collection('users')
    const docSnap = await userRef.where('email', '==', email).limit(1).get();
    console.log("DOC", docSnap)
    if (!docSnap.empty) {
      const userDoc = docSnap.docs[0];
      const user = userDoc.data();
      console.log("user1", user);

      await userDoc.ref.update({ tokens: balance });
      res.status(200).json({ message: 'Balance updated' });
    
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch(err){
    console.log(err)
  }
}

const sendtoUser = async (req, res) => {
  const username = req.body.target;
  const gift = req.body
  

try {
  const userRef = db.collection('users');
  const snapshot = await userRef.where('userName', '==', username).limit(1).get();
  if (snapshot.empty) {
    console.log('No matching documents.');
    res.status(404).json({ message: 'User not found' });
  } 
  
    const userDoc = snapshot.docs[0];
  if (userDoc) {
   await userDoc.ref.update({ gifts: FieldValue.arrayUnion(gift) });
    res.status(200).json({ message: 'Gift updated' });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
  
  //} else {
  
}catch(error){
  res.status(404).json({message: "couldnt update"})
}

}

const deleteUserPhoto = async ( req, res) => {
  const email = req.user
  const id = req.body.id
  try {
    const userRef = db.collection('users').where('email', '==', email).limit(1);
const userSnapshot = await userRef.get();

if (userSnapshot.empty) {
  console.log('No such document!');
} else {
  const userDoc = userSnapshot.docs[0];
  const user = userDoc.data();
  const userImmages = user.images
  const filteredImages = userImmages.filter(f => f.id !== id)
  await userDoc.ref.update({images: filteredImages})
  res.status(200).json({message: "immage deleted"});
}
  }catch(err){
    res.status(400).json({message: err.message})
  }
}

const setMainPhoto = async (req, res) => {
  const email = req.user
  const id = req.body.id

  try {
    const userRef = db.collection('users').where('email', '==', email).limit(1);
const userSnapshot = await userRef.get();

if (userSnapshot.empty) {
  console.log('No such document!');
} else {
  const userDoc = userSnapshot.docs[0];
  const user = userDoc.data();
  const userImmages = user.images
  const userMain = user.mainImage
  const images = userImmages.filter(f => f.id !== id)
  images.push(userMain)
  const image = userImmages.find(f => f.id === id)
  await userDoc.ref.update({mainImage: image, images: images})
  res.status(200).json({message: "immage set"});
}
  }catch(err){
    res.status(400).json({message: err.message})
  }
}
const addFriend = async (req, res) => {
  const email = req.user
  const addedUser = req.body.user

  try {
    const userRef = db.collection('users').where('email', '==', email).limit(1);
const userSnapshot = await userRef.get();
    const addedUserRef = db.collection('users').where('userName', '==', addedUser).limit(1);
const addedUserSnapshot = await addedUserRef.get();

if (userSnapshot.empty && addedUserSnapshot.empty) {
  console.log('No such documents!');
} else {
  const userDoc = userSnapshot.docs[0];
  const user = userDoc.data();

  const addedUserDoc = addedUserSnapshot.docs[0]
  const addedUser = addedUserDoc.data()

  const userFriendList = user.friendList
  const filterExistent = userFriendList.findIndex(f => f.userName === addedUser.userName)

  const addedUserFriendList = addedUser.friendList
  const filterExistentAdded = addedUserFriendList.findIndex(f => f.userName === user.userName)
  if(filterExistent === -1 && filterExistentAdded === -1){
    userFriendList.push({userName: addedUser.userName, email: addedUser.email, messages: []})
    addedUserFriendList.push({userName: user.userName, email: user.email, messages: []})
  await userDoc.ref.update({friendList: userFriendList})
  await addedUserDoc.ref.update({friendList: addedUserFriendList})

    res.status(200).json({message: "friends added"});
  }else{
    res.status(200).json({message: "friend already here"});
  }
  }
  }catch(err){
    res.status(400).json({message: err.message})
  }

}

const updateList = async (req, res) => {
  const email = req.user
  const friend = req.body.friend

  try {
    const userRef = db.collection('users').where('email', '==', email).limit(1);
const userSnapshot = await userRef.get();

if (userSnapshot.empty) {
  console.log('No such document!');
} else {

  const userDoc = userSnapshot.docs[0];
  const user = userDoc.data()
  const friendListData = user.friendList
  const friendIndex = friendListData.findIndex(f => f.userName === friend)
  if(friendIndex !== -1){
    const friendToMove = friendListData[friendIndex]
    /*friendListData.splice(friendIndex, 1)
    friendListData.unshift(0,0,friendToMove)*/

    const [clickedFriend] = friendListData.splice(friendIndex, 1);
    friendListData.unshift(clickedFriend);
    console.log("friendListData", friendListData)
  }
  await userDoc.ref.update({friendList: friendListData})
  res.status(200).json({message: "done"});
}
  }catch(err){
    res.status(400).json({message: err.message})
  }
}

const userDetail = async (req,res) => {
  const username = req.params.userId;
  const userRef = db.collection('users').where('userName', '==', username).limit(1);
const userSnapshot = await userRef.get();

if (userSnapshot.empty) {
  console.log('No such document!');
} else {
  const userDoc = userSnapshot.docs[0];
  const user = userDoc.data();
  res.json(user);
}
}

module.exports = {home,updateList,addFriend,deleteUserPhoto,setMainPhoto, about, currentUser,oneUserProfile,updateUnlockPhoto, updateUser, userDetail, updateUserBalance, sendtoUser, updateLike}