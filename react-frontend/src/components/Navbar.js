import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">My App</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
          <li className="nav-item">
              <Link className="nav-link" to="/Question">Question</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/descriptive-questions">Descriptive Questions</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/multiple-choice-questions">Multiple Choice Questions</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/file-manager">File Manager</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/search">Search</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/chat">Chat</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;