import { Alert, Button, TextInput } from 'flowbite-react';
import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { app } from '../firebase';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

function Dashboardprofile() {
  const { currentUser } = useSelector((state) => state.user);
  const filepickref = useRef();
  const [imagefile, setimagefile] = useState(null);
  const [imagefileurl, setimagefileurl] = useState(null);
  const [imageuploadprogress, setimageuploadprogress] = useState(null);
  const [imageuploaderror, setimageuploaderror] = useState(null);

  const handleuploadimage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setimagefile(file);
      setimagefileurl(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    if (imagefile) {
      uploadImage();
    }
  }, [imagefile]);

  const uploadImage = async () => {
    setimageuploaderror(null); 
    const storage = getStorage(app);
    const filename = new Date().getTime() + imagefile.name;
    const storageRef = ref(storage, filename);
    const uploadTask = uploadBytesResumable(storageRef, imagefile);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setimageuploadprogress(progress.toFixed(0));
      },
      (error) => {
        setimageuploaderror('Could not upload image (File must be less than 2MB)');
        setimageuploadprogress(null);
        setimagefile(null);
        setimagefileurl(null);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setimagefileurl(downloadURL);
          setimageuploadprogress(null); // Reset progress after upload is complete
        });
      }
    );
  };

  return (
    <div className='max-w-lg mx-auto p-3 w-full'>
      <h1 className='my-7 font-semibold text-center text-3xl'>Profile</h1>
      <form className='flex flex-col gap-4'>
        <input hidden type='file' accept='image/*' onChange={handleuploadimage} ref={filepickref} />
        <div className='relative w-32 h-32 self-center cursor-pointer shadow-md overflow-hidden rounded-full' onClick={() => filepickref.current.click()}>
          {imageuploadprogress !== null && (
            <CircularProgressbar value={imageuploadprogress || 0}
             text={ `${imageuploadprogress}%`} 
             strokeWidth={5} 
             styles={{ 
                 root: { 
                  width: '100%', 
                  height: '100%',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                },
                 path: {
                  stroke:`rgba(62, 152, 199, ${imageuploadprogress / 100})`,
                 },
              }}
          />
          )}
          <img className={`w-full h-full rounded-full border-8 border-[lightgray] object-cover ${imageuploadprogress !== null && imageuploadprogress < 100 && 'opacity-60'}`} src={imagefileurl || currentUser.profilePicture} alt='user' />
        </div>

        {imageuploaderror && <Alert color='failure'>{imageuploaderror}</Alert>}
        <TextInput type='text' id='username' placeholder='Username' defaultValue={currentUser.username} />
        <TextInput type='email' id='email' placeholder='Email' defaultValue={currentUser.email} />
        <TextInput type='password' id='password' placeholder='Password' />
        <Button type='submit' gradientDuoTone='purpleToBlue' outline>
          Update
        </Button>
      </form>
      <div className='text-red-500 flex justify-between mt-3'>
        <span className='cursor-pointer'>Delete Account</span>
        <span className='cursor-pointer'>Sign Out</span>
      </div>
    </div>
  );
}

export default Dashboardprofile;