const express = require("express")
const app = express()

const { addDoc, collection } =require("firebase/firestore")
const bodyParser =require("body-parser")
const {db} =require("./firebase.js")
const cors =require("cors")

app.use(express.json())
app.use(bodyParser.json())
app.use(cors())
const router =require("./routes/auth.js")


app.use('/api', router)
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});