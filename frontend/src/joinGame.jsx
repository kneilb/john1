import React, { useEffect, useState } from 'react';
import { Button, Radio, Select } from 'antd';

// TODO: useContext
import * as api from './api';

const { Option } = Select;

export default function JoinGame(props) {

    const [availableGames, setAvailableGames] = useState([]);
    const [defaultGame, setDefaultGame] = useState();
    const [selectedGame, setSelectedGame] = useState();
    const [availablePlayers, setAvailablePlayers] = useState([]);
    const [selectedPlayer, setSelectedPlayer] = useState();

    async function loadAvailableGames() {
        const games = await api.getGames();
        console.log(games);
        setAvailableGames(games);
        if (games.length >= 1) {
            setDefaultGame(games[0].id);
        }
    }

    useEffect(() => {
        // Load available games, reload on an interval
        loadAvailableGames();
        const interval = setInterval(() => {
            loadAvailableGames();
        }, 5000);

        // Clean up on unmount
        return () => clearInterval(interval);
    }, []);

    function handleStartGame() {
        console.log(`I want to play as ${selectedPlayer}`);

        // TODO: can ignore rejection & just carry on, taking control of the existing player!!
        // TODO: The "feature" outlined above is kinda handy for testing - hence the commented out code.
        // TODO: add auth via a randomly generated cookie, or just use the socket.io connection?
        api.join(selectedPlayer, selectedGame, props.onJoin, props.onError);
    }

    function handleGameSelected(gameId) {
        setSelectedGame(gameId);
        // TODO: Array.find()
        for (const game of availableGames) {
            if (game.id === gameId) {
                setAvailablePlayers(game.players);

                // TODO: This doesn't _quite_ work, we're always one click behind!
                if (!availablePlayers.includes(selectedPlayer)) {
                    setSelectedPlayer(game.players[0]);
                }
                break;
            }
        }
    }

    return (
        <>
            <Select
                defaultValue={defaultGame}
                onChange={(value) => handleGameSelected(value)}
                placeholder='Select a game'
                style={{ width: 200 }}
            >
                {availableGames.map((game) => <Option key={game.id} value={game.id}>{game.name}</Option>)}
            </Select>
            <Radio.Group options={availablePlayers} onChange={(e) => setSelectedPlayer(e.target.value)} value={selectedPlayer} />
            <Button type='primary' onClick={handleStartGame} >Start Game!!!1</Button>
        </>
    );
}
