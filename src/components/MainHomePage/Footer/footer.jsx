import React from 'react';
import './footer.css';
import { FaLinkedin, FaGithub, FaInstagramSquare } from 'react-icons/fa';

const Footer = () => {
  return (
    <div className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <img id='footer-logo' alt='img-logo' src={require('../../../Data/Images/logo.png')} />
        </div>
        <div className="footer-section">
          <h6>Product</h6>
          <a href="/">Features</a>
          <a href="/">Integrations</a>
          <a href="/">Pricing</a>
          <a href="/">FAQ</a>
        </div>
        <div className="footer-section">
          <h6>Company</h6>
          <a href="/">About Us</a>
          <a href="/">Careers</a>
          <a href="/">Privacy Policy</a>
          <a href="/">Terms of Service</a>
        </div>
        <div className="footer-section">
          <h6>Developers</h6>
          <a href="/">Public API</a>
          <a href="/">Documentation</a>
          <a href="/">Guides</a>
        </div>
        <div className="footer-section">
          <h6>Social Media</h6>
          <div className="social-icons">
            <a href="/"><FaLinkedin /></a>
            <a href="/"><FaGithub /></a>
            <a href="/"><FaInstagramSquare /></a>
          </div>
        </div>
      </div>
      <p className="footer-text">Made with ❤️ by <b>Yash Pandav</b></p>
    </div>
  );
};

export default Footer;
