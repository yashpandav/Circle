import React from "react";
import "./footer.css";
import { FaLinkedin, FaGithub } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="top-footer-div"></div>
      <div className="footer-content">
        <p className="love-text">ɱα∂ε ωเƭɦ ℓσѵε</p>
        <p className="by-text">ɓყ</p>
        <h1 className="name-text">𝕐𝔸𝕊ℍ ℙ𝔸ℕ𝔻𝔸𝕍</h1>
      </div>
      <div className="social-icons">
        <a href="https://www.linkedin.com/in/yash-pandav-139314290" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
        <a href="https://github.com/yashpandav" target="_blank" rel="noopener noreferrer"><FaGithub /></a>
      </div>
    </footer>
  );
};

export default Footer;