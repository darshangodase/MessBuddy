import React from 'react'
import {Link} from 'react-router-dom';
import {Button, Label ,TextInput} from 'flowbite-react';
function SignUp() {
  return (
    <div className='min-h-screen mt-20'>
      <div className="flex  p-3 max-w-3xl mx-auto flex-col md:flex-row md:items-center gap-5">
           <div className="flex-1">
            <Link to="/"className=" text-sm text-3xl font-bold dark:text-white">
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-2 py-1 rounded-md text-white">
                 BlogBreeze
              </span>
           </Link>
            <p className=" font-semibold text-md mt-6">
              This is a blog app .You can Sign up with your Username,Email and Password.
            </p>
           </div>
           <div className=" flex-1">
                <form className="flex flex-col gap-2 ">
                  <div>
                     <Label value="Username"className=""/>
                     <TextInput type="text" placeholder="xyz" id="username"/>
                  </div>
                  <div>
                     <Label value="Email"className=""/>
                     <TextInput type="email" placeholder="xyz@gmail.com" id="email"/>
                  </div>
                  <div>
                     <Label value="Password"className=""/>
                     <TextInput type="password" placeholder="Password" id="password"/>
                  </div>
                  <Button type="submit" gradientDuoTone="purpleToPink"className="mt-4">
                     Sign Up
                  </Button>
                </form>
                <div className="flex gap-2 mt-5 text-sm ">
                  <span className="">Have an account ? </span>
                  <Link to='/sign-in' className='text-blue-500' >Sign In</Link>
                </div>
           </div>
      </div>
    </div>
  )
}

export default SignUp
