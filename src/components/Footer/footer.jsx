import React from 'react';
import './footer.css';
import { FaLinkedin } from "react-icons/fa6";
import { FaGithub } from "react-icons/fa";
import { FaInstagramSquare } from "react-icons/fa";
const Footer = () => {
  return (
    <div className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <img id='footer-logo' src={require('../../Data/Images/logo.png')} alt='img-logo'></img>
        </div>
        <div className="footer-section">
          <h6>PRODUCT</h6>
          <a href="#">Features</a>
          <a href="#">Integrations</a>
          <a href="#">Pricing</a>
          <a href="#">FAQ</a>
        </div>
        <div className="footer-section">
          <h6>COMPANY</h6>
          <a href="#">About Us</a>
          <a href="#">Careers</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
        </div>
        <div className="footer-section">
          <h6>DEVELOPERS</h6>
          <a href="#">Public API</a>
          <a href="#">Documentation</a>
          <a href="#">Guides</a>
        </div>
        <div className="footer-section">
          <h6>SOCIAL MEDIA</h6>
          <div className="social-icons">
            <FaLinkedin />
            <FaGithub />
            <FaInstagramSquare />
          </div>
        </div>
      </div>
      <p className="footer-text">Made With Love ❤️ By <b>Yash Pandav</b></p>
    </div>
  );
};

export default Footer;