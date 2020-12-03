import React from 'react';
import Cookies from 'js-cookie';

import Game from './game.jsx'
import Welcome from './welcome.jsx'



export default function App(props) {
    const playerId = Cookies.get('player');

    return (playerId ? <Game /> : <Welcome />);
}
