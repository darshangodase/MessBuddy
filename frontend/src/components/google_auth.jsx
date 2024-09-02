import { Button } from 'flowbite-react';
import { AiFillGoogleCircle } from 'react-icons/ai';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { app } from '../firebase';
import { useDispatch } from 'react-redux';
import { signInSuccess, signInFailure, signInStart } from '../redux/user/userSlice';
import { useNavigate } from 'react-router-dom';

function GoogleAuth() {
  const auth = getAuth(app);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleGoogleClick = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      dispatch(signInStart());
      const result = await signInWithPopup(auth, provider);
      const res = await fetch('https://blogbreeze-nj8u.onrender.com/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: result.user.displayName,
          email: result.user.email,
          photoUrl: result.user.photoURL,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        dispatch(signInSuccess(data));
        navigate('/');
      } else {
        dispatch(signInFailure('Failed to Sign Up with Google'));
      }
    } catch (error) {
      dispatch(signInFailure('Failed to Sign Up with Google'));
    }
  };

  return (
    <Button type="button" gradientDuoTone='pinkToOrange' className='h-11' onClick={handleGoogleClick} outline>
      <AiFillGoogleCircle className='w-7 h-7 mr-2' />
      Continue with Google
    </Button>
  );
}

export default GoogleAuth;