import React from "react";
import "./footer.css";
import { FaLinkedin, FaGithub } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="top-footer-div"></div>
      <div className="footer-content">
        <p className="love-text">made with love</p>
        <p className="by-text">by</p>
        <h1 className="name-text">YASH PANDAV</h1>
      </div>
      <div className="social-icons">
        <a href="https://www.linkedin.com/in/yash-pandav-139314290" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
        <a href="https://github.com/yashpandav" target="_blank" rel="noopener noreferrer"><FaGithub /></a>
      </div>
    </footer>
  );
};

export default Footer;