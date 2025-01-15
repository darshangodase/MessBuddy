import React from "react";
import { Footer } from "flowbite-react";
import { Link } from "react-router-dom";
import { BsLinkedin, BsInstagram, BsGithub } from "react-icons/bs";

function footer() {
  return (
    <div>
      <Footer container className="border border-t-8 border-pink-300 font-rubik">
        <div className="">
          <div className="">
            <Link
              to="/"
              className="self-center whitespace-nowrap text-sm sm:text-xl font-semibold dark:text-white"
            >
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-1 rounded-md text-white">
                MessBuddy
              </span>
            </Link>
          </div>
          <Footer.Divider />
          <div className=" flex flex-wrap gap-6 sm:mt-0 mt-4 sm:justify-center">
            <Footer.Copyright
              href="#"
              by="MessBuddy"
              year={new Date().getFullYear()}
              className="font-semibold text-md"
            />
            <Footer.Icon
              href="https://www.linkedin.com/in/darshangodase"
              icon={BsLinkedin}
            />
            <Footer.Icon
              href="https://github.com/darshangodase "
              icon={BsGithub}
            />
            <Footer.Icon
              href="https://www.instagram.com/darshan10_12/"
              icon={BsInstagram}
            />
          </div>
        </div>
      </Footer>
    </div>
  );
}

export default footer;
