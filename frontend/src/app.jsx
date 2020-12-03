import React from 'react';
import {useCookies} from 'react-cookie';

import Game from './game.jsx'
import Welcome from './welcome.jsx'



export default function App(props) {
    const [cookies, addCookie, removeCookie] = useCookies(['player']);

    return (cookies.player ? <Game /> : <Welcome />);
}
