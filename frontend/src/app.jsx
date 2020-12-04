import React, { useState } from 'react';

import Game from './game.jsx'
import Welcome from './welcome.jsx'

export default function App(props) {
    const [playerId, setPlayerId] = useState();

    function handleSelect(id) {
        setPlayerId(id);
    }

    function handleSelectError(id) {
        // TODO
    }

    function handleExit() {
        setPlayerId();
    }

    return (
        playerId ?
            <Game onExit={handleExit} playerId={playerId} /> :
            <Welcome onSelect={handleSelect} onError={handleSelectError} />
    );
}
