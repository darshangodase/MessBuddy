import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Button, Label, Spinner, TextInput } from 'flowbite-react';
import { signInSuccess, signInStart, signInFailure, clearError } from '../redux/user/userSlice';
import { useDispatch, useSelector } from 'react-redux';
import Oauth from '../components/google_auth';

function SignIn() {
  const [formdata, setformdata] = useState({});
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error: errorMessage } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleChange = (e) => {
    setformdata({ ...formdata, [e.target.id]: e.target.value.trim() });
  };

  const handlesubmit = async (e) => {
    e.preventDefault();
    const { username, password } = formdata;

    // Basic validation
    if (!username || !password) {
      return dispatch(signInFailure('All fields are required'));
    }
    
    try {
      dispatch(signInStart());
      const res = await fetch(`/api/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formdata),
      });
      const data = await res.json();

      if (!res.ok) {
        return dispatch(signInFailure('Invalid credentials'));
      }
      dispatch(signInSuccess(data));
      navigate('/');
    } catch (error) {
      dispatch(signInFailure('Failed to Sign In'));
    }
  };

  return (
    <div className='min-h-screen mt-20'>
      <div className="flex p-3 max-w-3xl mx-auto flex-col md:flex-row md:items-center gap-5">
        <div className="flex-1">
          <Link to="/" className="text-3xl font-bold dark:text-white">
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-2 py-1 rounded-md text-white">
              BlogBreeze
            </span>
          </Link>
          <p className="font-semibold text-md mt-6">
            This is a blog app. You can Sign In with your Username and Password.
          </p>
        </div>
        <div className="flex-1">
          <h2 className="mb-3 text-3xl text-center font-semibold">Sign In</h2>
          <form className="flex flex-col gap-2" onSubmit={handlesubmit}>
            <div>
              <Label value="Username" className="" />
              <TextInput type="text" placeholder="darshan@10" id="username" onChange={handleChange} />
            </div>
            <div>
              <Label value="Password" className="" />
              <TextInput type="password" placeholder="********" id="password" onChange={handleChange} />
            </div>
            <Button type="submit" gradientDuoTone="purpleToPink" className="mt-4 mb-3" disabled={loading}>
              {loading ? (
                <>
                  <Spinner size='sm' />
                  <span className='ml-2'>Loading...</span>
                </>
              ) : (
                'Sign In'
              )}
            </Button>
            <Oauth/>
          </form>
          <div className="flex gap-2 mt-5">
            <span className="text-md">Don't Have an account?</span>
            <Link to='/signup' className='text-blue-500 font-medium'>Sign Up</Link>
          </div>
          {errorMessage && (
            <Alert className='mt-5 text-black font-semibold text-md' color='failure'>
              {errorMessage}
            </Alert>
          )}
          <div className="mt-5">
           
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignIn;