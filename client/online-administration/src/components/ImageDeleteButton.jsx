import { storage } from './../../firebaseConnect.js';
import { deleteObject, ref } from "firebase/storage"
const ImageDeleteButton = ({ user, id , onDelete}) => {
  const handleDelete = async () => {
    try {
        const imageRef = ref(storage, `${user.email}/${id}`)
         deleteObject(imageRef).then(()=>{
        console.log("deleted")
        onDelete(imageRef)
      }).catch((error)=>{
        console.log(error)
      })
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  return (
    <button onClick={handleDelete}>Delete Image</button>
  );
};

export default ImageDeleteButton;