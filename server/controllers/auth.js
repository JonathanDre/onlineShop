const {db} =  require("./../firebase.js")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const {createJWT} = require("../utils/auth.js")
const { addDoc, getDoc, doc } = require("firebase/firestore")
const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;


/// Trebuie sa verific daca nu exista 2 utilizatori cu acelasi username
const signup = async (req, res, next) => {
    console.log(req.body)
    let { firstName, lastName, userName, email, password, password_confirmation, age, gender,eyeColor, hairColor, body, description, country, city, invitee  } = req.body;
    let errors = [];
    console.log("gender", gender)
    let passwordMatch = true
    if (!firstName) {
      errors.push({ firstName: "required" });
    }
    if (!lastName) {
      errors.push({ lastName: "required" });
    }
    if (!userName) {
      errors.push({ userName: "required" });
    }
    if (!email) {
      errors.push({ email: "required" });
    }
    if (!emailRegexp.test(email)) {
      errors.push({ email: "invalid" });
    }
    if (!password) {
      errors.push({ password: "required" });
    }
    if (!password_confirmation) {
      errors.push({
       password_confirmation: "required",
      });
    }
    if (password != password_confirmation) {
      passwordMatch = false;
    }
    if (!age) {
      errors.push({
        age: "required",
      });
    }
    if (!gender) {
      errors.push({ gender: "required" });
    }
    if (!country) {
      errors.push({ country: "required" });
    }
    if (!city) {
      errors.push({ city: "required" });
    }
    if (errors.length > 0 ) {
      return res.status(422).json({ error: "Missing some fields", passwordCheck: "Passwords dont match" });
    }else if(!errors.length > 0 && !passwordMatch) {
      passwordMatch = true
      return res.status(422).json({ passwordCheck: "Passwords dont match" });
    }
    const anotherUserRef = db.collection('users')
    anotherUserRef.where("userName", '==', userName ).limit(1)
    .get()
    .then((querySnapshot) =>{
      if (!querySnapshot.empty) {
          return res.status(422).json({ errors: [{ user: "username already exists" }] });
      }})
    const usersRef = db.collection('users');
    console.log("userRef", usersRef)
    usersRef.where('email', '==', email).limit(1)
    .get()
    .then((querySnapshot) =>{
        if (!querySnapshot.empty) {
            return res.status(422).json({ errors: [{ user: "email already exists" }] });
        } else { 
           const user = {
             firstName: firstName,
             lastName: lastName,
             userName: userName,
             email: email,
             password: password,
             age: age,
             gender: gender,
             eyeColor: "",
             hairColor: "",
             body: "",
             description: "",
             country: country,
             images: [],
             mainImage: '',
             city: city,
             tokens: 50,
             gifts: [],
             subscription: {},
             photos: [],
             invitee: invitee,
             likedBy: [],
             usersLiked:[],
             notifications:[],
             messageNotifications:[],
             friendList:[]
            
           };
           console.log("querrrysnap", querySnapshot)
           bcrypt.genSalt(10, function(err, salt) { bcrypt.hash(password, salt, async function(err, hash) {
            if (err) throw err;
            user.password = hash;
            const currentDate = new Date(Date.now());
            const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
            user.dateCreated = currentDate.toDateString(undefined, options)

            let access_token = createJWT(
              user.email,
              user.userName,
              14400
            );
            console.log("after creteJWT")
            jwt.verify(access_token, process.env.TOKEN_SECRET, async (err,
      decoded) => {
              if (err) {
                 res.status(500).json({ erros: err });
              }
              if (decoded) {
                console.log(access_token)
                const addidng = await usersRef.add(user)
                .then(response => {
                  return res.status(200).json({
                    success: true,
                    token: access_token,
                    message: user
                 });
                })
                .catch(err => {
                  res.status(500).json({
                     errors: [{ error: err }]
                  });
               });
                  
                }
              });
            
            });
         });
        }
    })
    .catch(err =>{
        res.status(500).json({
          errors: [{ errors: 'Something went wrong' }]
        });
    })
  }
  const signin = (req, res) => {
    let { email, password } = req.body;
    let errors = [];
     if (!email) {
       errors.push({ email: "required" });
     }
     if (!emailRegexp.test(email)) {
       errors.push({ email: "invalid email" });
     }
     if (!password) {
       errors.push({ passowrd: "required" });
     }
     if (errors.length > 0) {
      return res.status(422).json({ errors: "Please check your email or password and try again" });
     }
    const usersRef = db.collection('users');
    usersRef.where('email', '==', email).limit(1)
    .get()
    .then((querySnapshot) =>{
      if (querySnapshot.empty) {
        console.log("not a user")
        return res.status(404).json({ errors: "Please check your email or password and try again" });
      } else {
        console.log("in the else")
        const user = querySnapshot.docs[0].data()
         bcrypt.compare(password, user.password).then(isMatch => {
            if (!isMatch) {
                console.log("fucked up")
             return res.status(400).json({ errors: "Password is incorect" });
            }
            console.log("before jwT")
      let access_token = createJWT(
        user.email,
        user.userName,
        14400
      );
      console.log("after creteJWT")
      jwt.verify(access_token, process.env.TOKEN_SECRET, (err,
decoded) => {
        if (err) {
           res.status(500).json({ errors: "Something wrong please try again"});
        }
        if (decoded) {
          console.log(access_token)
            return res.status(200).json({
               success: true,
               token: access_token,
               message: user
            });
          }
        });
       }).catch(err => {
         res.status(500).json({ errors: "Something wrong please try again"});
       });
     }
  }).catch(err => {
     res.status(500).json({ errors: "Something wrong please try again"});
  });
}
module.exports = {signup, signin}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               