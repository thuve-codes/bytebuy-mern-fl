import React from "react";

const Footer = () => {
  return (
    <footer className="w-full bg-gray-900 text-white py-4 mt-10">
      <div className="container mx-auto text-center">
        <p className="text-sm flex flex-wrap justify-center items-center gap-1">
          Crafted with <span className="text-red-500 text-lg">❤️</span> by{" "}
          <a
            href="https://github.com/thuve-codes"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline ml-1"
          >
            thuve-codes
          </a>
          <span className="ml-1">
            – Future Code Technologies Internship Assignment
          </span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
