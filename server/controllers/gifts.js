const {db} =  require("./../firebase.js")
const getAllGifts = async (req,res) => {
    
    const giftRef = db.collection('gifts')
    const snapshot = await giftRef.get();
   
    const gifts = []
  if (snapshot.empty) {
    console.log('No such document!');
  } else {
    snapshot.forEach(doc => {
        gifts.push(doc.data())
      });
    res.json(gifts);
  }
  }

  module.exports = {getAllGifts}