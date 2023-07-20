import { storage } from './../../firebaseConnect.js';
import { deleteObject, ref } from "firebase/storage"
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
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
    <DeleteOutlineOutlinedIcon fontSize='large' className="absolute w-1/3 right-2 bottom-2 opacity-50 hover:opacity-100 cursor-pointer h-1/4 p-0" onClick={handleDelete}/>
  );
};

export default ImageDeleteButton;