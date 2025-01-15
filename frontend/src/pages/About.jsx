import React from "react";

function About() {
  return (
    <div className="flex flex-col items-center justify-center  p-4 sm:p-16 lg:p-28 min-h-screen font-rubik">
      <h1 className="text-4xl font-bold font-poppins lg:text-6xl hover:text-teal-400 mb-8">
        About Us
      </h1>
      <p className="text-lg sm:text-xl text-center max-w-2xl mb-8 ">
        Welcome to
        <span className="hover:text-red-800"> MessBuddy</span>
        MessBuddy simplifies campus canteen and mess management. For students,
        it offers daily menus, meal feedback, capacity updates, and a space for
        community discussions. Mess owners can easily manage menus, update
        availability, and track feedback. Our mission is to enhance dining
        experiences by keeping everyone informed, connected, and engaged. Join
        us as we revolutionize dining, one meal at a time!{" "}
      </p>
    </div>
  );
}

export default About;
