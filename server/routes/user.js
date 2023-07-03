const express = require("express")
const router = express.Router();
const {home,setMainPhoto,updateList,addFriend, about,currentUser,deleteUserPhoto, updateUser,updateUnlockPhoto, userDetail, updateUserBalance, sendtoUser, updateLike} = require ("./../controllers/user.js")
const {verifyToken} = require("./../middleware/checkToken.js")

router.get('/home',verifyToken, home);
router.get('/homeLogin', home);
router.get('/about',verifyToken, about)
router.get('/currentuser',verifyToken, currentUser)
router.post('/updateLike',verifyToken, updateLike)
router.post('/updateUser',verifyToken, updateUser)
router.post('/sendToUser',verifyToken, sendtoUser)
router.get('/:userId',verifyToken, userDetail)
router.post('/updateBalance',verifyToken, updateUserBalance)
router.post('/updateUnlockPhoto',verifyToken, updateUnlockPhoto)
router.post('/deleteUserPhoto',verifyToken, deleteUserPhoto)
router.post('/setMainPhoto',verifyToken, setMainPhoto)
router.post('/addFriend',verifyToken, addFriend)
router.post('/updateList',verifyToken, updateList)




module.exports = router