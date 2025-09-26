import React from "react";
import logo from '../assets/logo-1.png';
import '../index.css';
import '../App.css';

const Header = () => {
    return (

        <nav className="navbar flex flex-row items-center justify-between">
            <div className="flex flex-row items-center space-x-4">
                <span className="sr-only">React-agent</span>
                <img src={logo} alt="React-agent" className="App-header-logo" />
                <p>Hello User</p>
            </div>
        </nav>

    )
}

export default Header;