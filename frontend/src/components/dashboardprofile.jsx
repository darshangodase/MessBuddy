import { Alert, Button, Modal, TextInput } from 'flowbite-react';
import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { app } from '../firebase';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { updateFailure, updateStart, updateSuccess, deleteUserStart, deleteUserSuccess, deleteUserFailure, signoutsuccess } from '../redux/user/userSlice';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import { Link } from 'react-router-dom';

function Dashboardprofile() {
  const { currentUser, error, isFetching } = useSelector((state) => state.user);
  const filepickref = useRef();
  const dispatch = useDispatch();
  const [imagefile, setimagefile] = useState(null);
  const [imagefileurl, setimagefileurl] = useState(null);
  const [imageuploadprogress, setimageuploadprogress] = useState(null);
  const [formdata, setformdata] = useState({});
  const [imagefileuploading, setimageuploading] = useState(false);
  const [updateusersuccess, setupdateusersuccess] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showmodel, setshowmodel] = useState(false);

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
    setimageuploading(true);
    setErrorMessage(null);
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
        setErrorMessage('Could not upload image (File must be less than 2MB)');
        setimageuploadprogress(null);
        setimagefile(null);
        setimagefileurl(null);
        setimageuploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setimagefileurl(downloadURL);
          setformdata({ ...formdata, profilePicture: downloadURL });
          setimageuploading(false);
        });
      }
    );
  };

  const handlechange = (e) => {
    setformdata({ ...formdata, [e.target.id]: e.target.value.trim() });
  };

  const handlesubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setupdateusersuccess(null);

    if (Object.keys(formdata).length === 0) {
      setErrorMessage("No changes detected");
      return;
    }
    if (imagefileuploading) {
      setErrorMessage("Please wait for image to upload");
      return;
    }
    dispatch(updateStart());

    try {
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formdata),
      });
      const data = await res.json();
      if (res.ok) {
        dispatch(updateSuccess(data));
        setupdateusersuccess("User's profile updated successfully");
      } else {
        setErrorMessage(data.message);
        dispatch(updateFailure(data.message));
      }
    } catch (e) {
      dispatch(updateFailure("Failed to update user"));
      setErrorMessage("Failed to update user");
    }
  };

  const handledeleteuser = async () => {
    setshowmodel(false);
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (res.ok) {
        dispatch(deleteUserSuccess(data));
      } else {
        setErrorMessage(data.message);
        dispatch(deleteUserFailure(data.message));
      }
    } catch (error) {
      setErrorMessage(error.message);
      dispatch(deleteUserFailure(error.message));
    }
  };

  const handlesignout = async () => {
    try {
      const res = await fetch(`/api/user/signout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (res.ok) {
        dispatch(signoutsuccess(data));
      } else {
        setErrorMessage("User signout failed");
      }
    } catch (error) {
      setErrorMessage("User signout failed");
    }
  };

  return (
    <div className='max-w-lg mx-auto p-3 w-full'>
      <h1 className='my-7 font-semibold text-center text-3xl'>Profile</h1>
      <form className='flex flex-col gap-4' onSubmit={handlesubmit}>
        <input hidden type='file' accept='image/*' onChange={handleuploadimage} ref={filepickref} />
        <div className='relative w-32 h-32 self-center cursor-pointer shadow-md overflow-hidden rounded-full' onClick={() => filepickref.current.click()}>
          {imageuploadprogress !== null && (
            <CircularProgressbar
              value={imageuploadprogress || 0}
              text={`${imageuploadprogress}%`}
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
                  stroke: `rgba(62, 152, 199, ${imageuploadprogress / 100})`,
                },
              }}
            />
          )}
          <img
            className={`w-full h-full rounded-full border-8 border-[lightgray] object-cover ${imageuploadprogress !== null && imageuploadprogress < 100 && 'opacity-60'}`}
            src={imagefileurl || currentUser.profilePicture}
            alt='user'
          />
        </div>

        <TextInput type='text' id='username' placeholder='Username' defaultValue={currentUser.username} onChange={handlechange} />
        <TextInput type='email' id='email' placeholder='Email' defaultValue={currentUser.email} onChange={handlechange} />
        <TextInput type='password' id='password' placeholder='Password' onChange={handlechange} />

        <Button type='submit' gradientDuoTone='purpleToBlue' disabled={isFetching || imagefileuploading} outline>
          {isFetching ? 'Loading...' : 'Update'}
        </Button>
        {
          currentUser.isAdmin && (
            <Link to={'/create-post'}>
              <Button gradientDuoTone='purpleToPink' className='mt-3 w-full'>
                Create a post
              </Button>
            </Link>
          )
        }
      </form>

      <div className='text-red-500 flex justify-between mt-3'>
        <span onClick={() => setshowmodel(true)} className='cursor-pointer'>Delete Account</span>
        <span onClick={handlesignout} className='cursor-pointer'>Sign Out</span>
      </div>

      {updateusersuccess && (<Alert className="mt-4" color='success'>{updateusersuccess}</Alert>)}

      <Modal show={showmodel} onClose={() => setshowmodel(false)} popup size='md'>
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400" />
            <h3 className="mb-5 text-lg font-normal text-gray-500">Are you sure you want to delete your account?</h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={handledeleteuser}>Yes, I'm sure</Button>
              <Button color="gray" onClick={() => setshowmodel(false)}>No, cancel</Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
      {errorMessage && <Alert color='failure' className='mt-4'>{errorMessage}</Alert>}
    </div>
  );
}

export default Dashboardprofile;