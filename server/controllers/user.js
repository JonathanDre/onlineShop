const { db } = require("./../firebase.js")
const jwt = require("jsonwebtoken")
const { FieldValue } = require("firebase-admin/firestore")

const home = async function (req, res) {
  const usersRef = db.collection('users');
  const users = []
  await usersRef.where('gender', '==', "female")
    .get()
    .then((querySnapshot) => {
      if (!querySnapshot.empty) {
        querySnapshot.docs.forEach((document) => {
          users.push(document.data())
        })
        const data = { users };
        res.status(200).json(data)
      } else {
        res.status(404).json({ "message": "not found" })
      }
    }).catch(err => {
      res.status(500).json({ erros: err });
    });
}

const about = async function (req, res) {
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

const currentUser = async (req, res) => {
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

const updateUnlockPhotoUser = async (req, res) => {
  const email = req.user;
  const id = req.body.id
  const from = req.body.from
  const price = req.body.price
  const url = req.body.url

  try {
    const userRef = db.collection('users');
    const docSnap = await userRef.where('email', '==', email).limit(1).get();
    if (!docSnap.empty) {
      const userDoc = docSnap.docs[0];
      const user = userDoc.data();
      
        const tokens = user.tokens
        if (tokens == 0) {
          return res.status(400).json({ errors: "Not enought tokens" })
        }
        if (price < tokens || price === tokens) {
          const photos = user.photos
          const newTokens = user.tokens - price
          const newPhotos = [{id: id, from: from, url: url}, ...photos]
          await userDoc.ref.update({ photos : newPhotos, tokens: newTokens});
          res.status(200).json({ photo: {id: id, from: from, url: url} });
        }else{
          return res.status(400).json({ errors: "Not enought tokens" });
        }
      } else {
        return res.status(404).json({ errors: 'User doesn\'t exist' });
      }
    
  }
  catch (error) {
    return res.status(500).json({ errors: "Something went wrong, try again" });
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
      if (tokens == 0) {
        return res.status(400).json({ errors: "Not enought tokens" })
        
      }
      const photoIndex = user.photos.findIndex(photo => photo.id === id);
      const friendList = user.friendList
      const friendIndex = friendList.findIndex(f => f.userName === from);
      if (price < tokens || price === tokens) {
        if (photoIndex !== -1 && friendIndex !== -1) {
          // Update the property of the photo object
          const filteredNotImages = friendList[friendIndex].messages.filter(f => !f.image)
          const filteredImages = friendList[friendIndex].messages.filter(f => f.image)
          const message = filteredImages.find(f => f.id === id)
          if (message) {
            message.blured = false
            const filteredFriendList = friendList[friendIndex].messages.filter(f => f !== message)
            filteredFriendList.push(message)

            user.photos[photoIndex].blured = false;
            photos = user.photos
            const newTokens = tokens - price
            user.tokens = newTokens
            const newUserTokens = user.tokens
            // Update the user document in Firebase Firestore with the modified photo
            await userDoc.ref.update({ photos, tokens: newUserTokens });
            await userDoc.ref.update({ friendList: friendList });

            res.status(200).json({ id: id });
          }
        } else {
          return res.status(404).json({ errors: "no such photo exists" })
          
        }
      } else {
        return res.status(400).json({ errors: "Not enought tokens" })
      }
    } else {
      console.log("in th error")
      res.status(404).json({ errors: "User not found" });
    }
  } catch (error) {
    console.log(error)
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
  const { image, main } = req.body


  try {
    const userRef = db.collection('users')
    const docSnap = await userRef.where('email', '==', email).limit(1).get();
    if (!docSnap.empty) {
      const userDoc = docSnap.docs[0];
      const user = userDoc.data();
      console.log("user1", user);
      if (main) {
        await userDoc.ref.update({ mainImage: image });
        res.status(200).json({ mainImage: image });

      } else {
        const imageList = user.images
        await userDoc.ref.update({ images: [image, ...imageList] });
        res.status(200).json({ images: [image, ...imageList] });

      }
    } else {
      res.status(404).json({ errors: 'User not found' });
    }
  } catch (err) {
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


    if (!docSnap.empty) {
      const userDoc = docSnap.docs[0];
      const user = userDoc.data();
      const list = user.usersLiked
      const newList = [userToUpdate, ...list]
      await userDoc.ref.update({ usersLiked: newList });

      res.status(200).json({ message: 'User added' });

    } else {
      res.status(404).json({ message: 'Users not found' });
    }
  } catch (err) {
    console.log(err)
  }
}

const removeLike = async (req, res) => {
  const userName = req.userName
  const userToUpdate = req.body.userId
  console.log("userName", userName)
  console.log("userToUpdate", userToUpdate)
  try {
    const userRef = db.collection('users')
    const docSnap = await userRef.where('userName', '==', userName).limit(1).get();

    if (!docSnap.empty) {
      const userDoc = docSnap.docs[0];
      const user = userDoc.data();
      const list = user.usersLiked
      const newList = list.filter(f => f !== userToUpdate)
      await userDoc.ref.update({ usersLiked: newList });

      res.status(200).json({ message: 'User added' });

    } else {
      res.status(404).json({ message: 'Users not found' });
    }
  } catch (err) {
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
  } catch (err) {
    console.log(err)
  }
}

const sendtoUser = async (req, res) => {
  const username = req.body.target;
  const gift = req.body
  console.log("username",username)
  console.log("reqbody",req.body)


  try {
    const userRef = db.collection('users');
    const snapshot = await userRef.where('userName', '==', username).limit(1).get();
    if (snapshot.empty) {
      console.log('No matching documents.');
      res.status(404).json({ message: 'User not found' });
    }

    const userDoc = snapshot.docs[0];
    if (userDoc) {
      const gifts = userDoc.data().gifts
      await userDoc.ref.update({ gifts: [gift, ...gifts] });
      res.status(200).json({ message: 'Gift updated' });
    } else {
      res.status(404).json({ errors: 'User not found' });
    }

    //} else {

  } catch (error) {
    res.status(404).json({ errors: "couldnt update" })
  }

}

const deleteUserPhoto = async (req, res) => {
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
      await userDoc.ref.update({ images: filteredImages })
      res.status(200).json({ images: filteredImages });
    }
  } catch (err) {
    res.status(400).json({ message: err.message })
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
      await userDoc.ref.update({ mainImage: image, images: images })
      res.status(200).json({ message: "immage set" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message })
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
      if (filterExistent === -1 && filterExistentAdded === -1) {

        const newUserFriendList = [{ userName: addedUser.userName, email: addedUser.email, mainImage: addedUser.mainImage, messages: [] }, ...userFriendList]
        const newAddedUserFriendList = [{ userName: user.userName, email: user.email, mainImage: user.mainImage, messages: [] }, ...addedUserFriendList]

        await userDoc.ref.update({ friendList: newUserFriendList })
        await addedUserDoc.ref.update({ friendList: newAddedUserFriendList })

        res.status(200).json({ data: { friendList: newUserFriendList } });
      } else {

        const singleUser = userFriendList[filterExistent]
        const singleAddedUser = addedUserFriendList[filterExistentAdded]

        const newUserFriendList = [singleUser, ...userFriendList.filter(f => f.userName !== singleUser.userName)]
        const newAddedUserFriendList = [singleAddedUser, ...addedUserFriendList.filter(f => f.userName !== singleAddedUser.userName)]

        await userDoc.ref.update({ friendList: newUserFriendList })
        await addedUserDoc.ref.update({ friendList: newAddedUserFriendList })
        res.status(200).json({ data: { friendList: newUserFriendList } });
      }
    }
  } catch (err) {
    res.status(400).json({ message: err.message })
  }

}

const getUserById = async (req, res) => {
  const name = req.body.name

  try {
    const userRef = db.collection('users').where('userName', '==', name).limit(1);
    const userSnapshot = await userRef.get();

    if (userSnapshot.empty) {
      console.log('No such documeasasasdsadasdsdant!');
    } else {
      const userDoc = userSnapshot.docs[0];
      const userData = userDoc.data()
      console.log("userData", userData)
      res.status(200).json({ user: userData });
    }
  } catch (err) {
    res.status(400).json({ errors: "No such user exists!" })
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
      if (friendIndex !== -1) {
        const friendToMove = friendListData[friendIndex]
        /*friendListData.splice(friendIndex, 1)
        friendListData.unshift(0,0,friendToMove)*/
        const updatedUserList = [friendToMove, ...friendListData.filter(f => f.userName !== friend)];
        console.log("friendListData", friendListData)
        await userDoc.ref.update({ friendList: updatedUserList })
        res.status(200).json({ message: "done" });
      } else {
        res.status(400).json({ message: "not found" })
      }
    }
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

const clearNotifications = async (req, res) => {
  const email = req.user
  console.log("email", email)
  try {
    const userRef = db.collection('users').where('email', '==', email).limit(1);
    const userSnapshot = await userRef.get();

    if (userSnapshot.empty) {
      console.log('No such documeasasasdsadasdsdant!');
    } else {
      const userDoc = userSnapshot.docs[0];
      await userDoc.ref.update({ notifications: [] })
      res.status(200).json({ message: "notifications deleted" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

const updateDescription = async (req, res) => {
  const email = req.user
  const values = req.body
  console.log("email", email)
  try {
    const userRef = db.collection('users').where('email', '==', email).limit(1);
    const userSnapshot = await userRef.get();

    if (userSnapshot.empty) {
      console.log('No such documeasasasdsadasdsdant!');
    } else {
      const userDoc = userSnapshot.docs[0];
      await userDoc.ref.update({ ...values })
      res.status(200).json({ message: "description updated" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}
const updateMessageNotif = async (req, res) => {
  const email = req.user
  const name = req.body.name
  console.log("req.body", req.body)
  console.log("email", email)
  console.log("name", name)
  try {
    const userRef = db.collection('users').where('email', '==', email).limit(1);
    const userSnapshot = await userRef.get();

    if (userSnapshot.empty) {
      console.log('No such documeasasasdsadasdsdant!');
    } else {
      const userDoc = userSnapshot.docs[0];
      const messageNotif = userDoc.data().messageNotifications
      console.log("messageNotif", messageNotif)
      const filteredMessages = messageNotif.filter(f => f !== name)
      await userDoc.ref.update({ messageNotifications: filteredMessages })
      res.status(200).json({ message: "messageNotifications updated" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

const userDetail = async (req, res) => {
  const username = req.params.userId;
  const userRef = db.collection('users').where('userName', '==', username).limit(1);
  const userSnapshot = await userRef.get();

  if (userSnapshot.empty) {
    console.log('asdocument!');
  } else {
    const userDoc = userSnapshot.docs[0];
    const user = userDoc.data();
    res.json(user);
  }
}

module.exports = { home, getUserById, updateDescription, updateMessageNotif,updateUnlockPhotoUser, removeLike, updateList, clearNotifications, addFriend, deleteUserPhoto, setMainPhoto, about, currentUser, oneUserProfile, updateUnlockPhoto, updateUser, userDetail, updateUserBalance, sendtoUser, updateLike }