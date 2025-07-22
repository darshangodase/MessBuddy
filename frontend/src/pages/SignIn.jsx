import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Label, Spinner, TextInput, Radio } from 'flowbite-react';
import { useDispatch, useSelector } from 'react-redux';
import { signInSuccess, signInStart, signInFailure, clearError } from '../redux/user/userSlice';
import toast from 'react-hot-toast';
import axios from 'axios';

function SignIn() {
  const [formdata, setformdata] = useState({});
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error: errorMessage } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(clearError());
    return () => {
      dispatch(clearError());
      toast.dismiss();
    };
  }, [dispatch]);

  useEffect(() => {
    if (errorMessage) {
      // toast.error(errorMessage);
    }
  }, [errorMessage]);

  const handleChange = (e) => {
    setformdata({ ...formdata, [e.target.id]: e.target.value.trim() });
  };

  const handleRoleChange = (e) => {
    setformdata({ ...formdata, login_role: e.target.value });
  };

  const handlesubmit = async (e) => {
    e.preventDefault();
    const { username, password, login_role } = formdata;

    if (!username || !password || !login_role) {
      return dispatch(signInFailure('All fields are required'));
    }
    
    try {
      dispatch(signInStart());
      const URL = `${import.meta.env.VITE_BACKEND_URL}/api/auth/signin`;
      const res = await axios.post(URL, formdata, { withCredentials: true });
      if (res.data.success === false) {
        return dispatch(signInFailure('Invalid credentials'));
      }
      dispatch(signInSuccess(res.data.user));
      toast.success('Sign In Successfully');
      navigate('/');
    } catch (error) {
      dispatch(signInFailure('Failed to Sign In'));
    }
  };

  return (
    <div className='min-h-screen mt-20 font-rubik'>
      <div className="flex p-3 max-w-3xl mx-auto flex-col md:flex-row md:items-center gap-5">
        <div className="flex-1">
          <Link to="/" className="text-3xl font-bold dark:text-white">
          <span className="bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-1 rounded-md text-white">
            MessBuddy
          </span>
          </Link>
          <p className="font-semibold text-md mt-6">
            This is a mess management app. You can Sign In with your Username, Password, and Login Role.
          </p>
        </div>
        <div className="flex-1">
          <h2 className="mb-3 text-3xl text-center font-semibold font-poppins">Sign In</h2>
          <form className="flex flex-col gap-2" onSubmit={handlesubmit}>
            <div>
              <Label value="Username" className="" />
              <TextInput type="text" placeholder="darshan@10" id="username" onChange={handleChange} />
            </div>
            <div>
              <Label value="Password" className="" />
              <TextInput type="password" placeholder="********" id="password" onChange={handleChange} />
            </div>
            <div>
              <Label value="Login Role" className=" mt-3 " />
              <div className="flex gap-4 mt-4">
                <Radio id="user" name="login_role" value="User" onChange={handleRoleChange} />
                <Label htmlFor="user">User</Label>
                <Radio id="mess_owner" name="login_role" value="Mess Owner" onChange={handleRoleChange} />
                <Label htmlFor="mess_owner">Mess Owner</Label>
              </div>
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
          </form>
          <div className="flex gap-2 mt-5">
            <span className="text-md">Don't Have an account?</span>
            <Link to='/signup' className='text-blue-500 font-medium'>Sign Up</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignIn;