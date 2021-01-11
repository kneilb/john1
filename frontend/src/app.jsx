import React, { useState } from 'react';

import Game from './game.jsx'
import Welcome from './welcome.jsx'

export default function App(props) {
    const [playerId, setPlayerId] = useState();

    function handleJoin(id) {
        setPlayerId(id);
    }

    function handleJoinError(id) {
        // TODO
        console.log('You were rejected :(')
    }

    function handleExit() {
        setPlayerId();
    }

    return (
        playerId ?
            <Game onExit={handleExit} playerId={playerId} /> :
            <Welcome onJoin={handleJoin} onJoinError={handleJoinError} />
    );
}
