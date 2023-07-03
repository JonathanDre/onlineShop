const {db} =  require("./../firebase.js")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const {createJWT} = require("../utils/auth.js")
const { addDoc, getDoc, doc } = require("firebase/firestore")
const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;


/// Trebuie sa verific daca nu exista 2 utilizatori cu acelasi username
const signup = async (req, res, next) => {

    let { firstName, lastName, userName, email, password, password_confirmation, age, gender,eyeColor, hairColor, body, description, country, city, invitee  } = req.body;
    let errors = [];
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
      errors.push({ password: "mismatch" });
    }
    if (!age) {
      errors.push({
        age: "required",
      });
    }
    if (!gender) {
      errors.push({ gender: "required" });
    }
    if (!eyeColor) {
      errors.push({ eyeColor: "required" });
    }
    if (!hairColor) {
      errors.push({ hairColor: "required" });
    }
    if (!body) {
      errors.push({ body: "required" });
    }
    if (!description) {
      errors.push({ description: "required" });
    }
    if (!country) {
      errors.push({ country: "required" });
    }
    if (!city) {
      errors.push({ city: "mismatch" });
    }
    if (errors.length > 0) {
      return res.status(422).json({ errors: errors });
    }
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
             eyeColor: eyeColor,
             hairColor: hairColor,
             body: body,
             description: description,
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
             usersLiked:[]

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
              3600
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
          errors: [{ error: 'Something went wrong' }]
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
      return res.status(422).json({ errors: errors });
     }
    const usersRef = db.collection('users');
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
        user.userName,
        3600
      );
      console.log("after creteJWT")
      jwt.verify(access_token, process.env.TOKEN_SECRET, (err,
decoded) => {
        if (err) {
           res.status(500).json({ erros: err });
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
         res.status(500).json({ erros: err });
       });
     }
  }).catch(err => {
     res.status(500).json({ erros: err });
  });
}
module.exports = {signup, signin}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               