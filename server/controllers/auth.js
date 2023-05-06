const {db} =  require("./../firebase.js")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const createJWT = require("../utils/auth.js")
const { addDoc, getDoc, doc } = require("firebase/firestore")

const signup = async (req, res, next) => {

    let { name, email, password, password_confirmation } = req.body;
    console.log(req.body)
    const usersRef = db.collection('users');
    console.log("userRef", usersRef)
    usersRef.where('email', '==', email).limit(1)
    .get()
    .then((querySnapshot) =>{
        if (!querySnapshot.empty) {
            return res.status(422).json({ errors: [{ user: "email already exists" }] });
        } else {
           const user = {
             name: name,
             email: email,
             password: password,
           };
           console.log("querrrysnap", querySnapshot)
           bcrypt.genSalt(10, function(err, salt) { bcrypt.hash(password, salt, async function(err, hash) {
            if (err) throw err;
            user.password = hash;
            const addidng = await usersRef.add(user)
                .then(response => {
                   res.status(200).json({
                     success: true,
                     result: response
                   })
                })
                .catch(err => {
                  res.status(500).json({
                     errors: [{ error: err }]
                  });
               });
            });
         });
        }
    })
    .catch(err =>{
        res.status(500).json({
          errors: [{ error: 'Something went wrong' }]
        });
    })
  }
  const signin = (req, res) => {
    let { email, password } = req.body;
    const usersRef = db.collection('users');
    console.log("userRef", usersRef)
    usersRef.where('email', '==', email).limit(1)
    .get()
    .then((querySnapshot) =>{
      if (querySnapshot.empty) {
        console.log("not a user")
        return res.status(404).json({
          errors: [{ user: "not found" }],
        });
      } else {
        console.log("in the else")
        const user = querySnapshot.docs[0].data()
        console.log("user", user)
         bcrypt.compare(password, user.password).then(isMatch => {
            if (!isMatch) {
                console.log("fucked up")
             return res.status(400).json({ errors: [{ password:
"incorrect" }] 
             });
            }
            console.log("before jwT")
      let access_token = createJWT(
        user.email,
        user.name,
        3600
      );
      console.log("after creteJWT")
      jwt.verify(access_token, process.env.TOKEN_SECRET, (err,
decoded) => {
        if (err) {
           res.status(500).json({ erros: err });
        }
        if (decoded) {
            return res.status(200).json({
               success: true,
               token: access_token,
               message: user
            });
          }
        });
       }).catch(err => {
         res.status(500).json({ erros: err });
       });
     }
  }).catch(err => {
     res.status(500).json({ erros: err });
  });
}
module.exports = {signup, signin}