'use client';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
      <div className="container">
        <a className="navbar-brand" href="#home">LOGO</a>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item"><a className="nav-link" href="#home">home</a></li>
            <li className="nav-item"><a className="nav-link" href="#service">services</a></li>
            <li className="nav-item"><a className="nav-link" href="#about">about</a></li>
            <li className="nav-item"><a className="nav-link" href="#gallery">gallery</a></li>
            <li className="nav-item"><a className="nav-link" href="#forms">forms</a></li>
          </ul>
        </div>
      </div>
    </nav>
  );
}