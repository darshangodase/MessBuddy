import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Button, Label, Spinner, TextInput } from 'flowbite-react';
import Oauth from '../components/google_auth';
import { useDispatch, useSelector } from 'react-redux';
import { clearError } from '../redux/user/userSlice';

function SignUp() {
  const [formdata, setformdata] = useState({});
  const [errorMessage, seterrorMessage] = useState(null);
  const [loading, setloading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authError = useSelector((state) => state.user.error);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleChange = (e) => {
    setformdata({ ...formdata, [e.target.id]: e.target.value.trim() });
  };

  const handlesubmit = async (e) => {
    e.preventDefault();

    const { username, email, password } = formdata;

    if (!username || !email || !password) {
      setloading(false);
      return seterrorMessage('All fields are required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setloading(false);
      return seterrorMessage('Invalid email format');
    }
    if (password.length < 8) {
      setloading(false);
      return seterrorMessage('Password must be at least 8 characters long');
    }

    try {
      seterrorMessage(null);
      setloading(true);
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formdata),
      });
      const data = await res.json();

      if (data.success === false) {
        setloading(false);
        seterrorMessage('User Already Exists');
      } else {
        setloading(false);
        seterrorMessage('User Sign Up Successful');
        navigate('/signin');
      }
    } catch (error) {
      setloading(false);
      seterrorMessage('Failed to Sign Up');
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
            This is a blog app. You can Sign up with your Username, Email, and Password.
          </p>
        </div>
        <div className="flex-1">
          <h2 className="mb-3 text-3xl text-center font-semibold">Sign Up</h2>
          <form className="flex flex-col gap-2" onSubmit={handlesubmit}>
            <div>
              <Label value="Username" className="" />
              <TextInput type="text" placeholder="darshan@10" id="username" onChange={handleChange} />
            </div>
            <div>
              <Label value="Email" className="" />
              <TextInput type="email" placeholder="abc@gmail.com" id="email" onChange={handleChange} />
            </div>
            <div>
              <Label value="Password" className="" />
              <TextInput type="password" placeholder="Password" id="password" onChange={handleChange} />
            </div>
            <Button type="submit" gradientDuoTone="purpleToPink" className="mt-4" disabled={loading}>
              {
                loading ? (<><Spinner size='sm' /><span className='ml-2'>Loading...</span></>) : "Sign Up"
              }
            </Button>
            <Oauth />
          </form>

          <div className="flex gap-2 mt-5">
            <span className="text-md">Have an account?</span>
            <Link to='/signin' className='text-blue-500 font-medium'>Sign In</Link>
          </div>

          {(errorMessage || authError) && (
            <Alert className='mt-5 text-black font-semibold text-md' color='failure'>
              {errorMessage || authError}
            </Alert>
          )}

        </div>
      </div>
    </div>
  );
}

export default SignUp;