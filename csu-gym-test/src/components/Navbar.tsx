'use client';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const prefix = pathname === '/' ? '' : '/';

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark fixed-top"
      style={{
        backgroundImage: 'linear-gradient(135deg, rgba(3, 120, 26, 0.95), rgba(0, 80, 35, 0.93))',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div className="container">
        <a className="navbar-brand" href={`${prefix}#home`}>
          <img 
            src="/logo3.png" 
            alt="CSU Sports Logo" 
            style={{ width: '40px', height: '40px' }} 
          />
        </a>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item"><a className="nav-link" href={`${prefix}#home`}>home</a></li>
            <li className="nav-item"><a className="nav-link" href={`${prefix}#service`}>services</a></li>
            <li className="nav-item"><a className="nav-link" href={`${prefix}#about`}>about</a></li>
            <li className="nav-item"><a className="nav-link" href={`${prefix}#documentation`}>documentation</a></li>
            <li className="nav-item"><a className="nav-link" href="/forms">forms</a></li>
          </ul>
        </div>
      </div>
    </nav>
  );
}