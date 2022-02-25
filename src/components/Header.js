import React from 'react';
import logo_header from '../images/logo-header.svg';

const Header = () => {
    return (
        <header className="header">
            <a className="header__link" href="#" target="_blank">
                <img className="header__logo" src={logo_header} alt="Логотип" />
            </a>
        </header>
    );
}

export default Header;