import React from 'react';

function About() {
  return (
    <div className="flex flex-col items-center justify-center  p-4 sm:p-16 lg:p-28 min-h-screen">
      <h1 className="text-4xl font-bold font-serif lg:text-6xl hover:text-teal-400 mb-8">About Us</h1>
      <p className="text-lg sm:text-xl text-center max-w-2xl mb-8">
      Welcome to 
        <span className="hover:text-red-800"> MessBuddy</span>
        ! We are your trusted platform for managing both
        campus canteens and messes. At MessBuddy, we aim to streamline your
        dining experience by providing daily menus, meal feedback options,
        capacity updates, and a space for community discussions. Whether you're
        a student tracking meal plans or someone managing the operations of a
        canteen or mess, we’ve got you covered. Our mission is to simplify and
        enhance how you interact with your dining facilities, making it easier
        to stay informed, share feedback, and engage with others. Join us as we
        revolutionize dining management, one meal at a time!      </p>
      
      </div>
  );
}

export default About;