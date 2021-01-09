import React, { useEffect, useState } from 'react';
import { Button, Input, Radio, Select } from 'antd';

import * as api from './api';

const { Option } = Select;
const { Search } = Input;

export default function Welcome(props) {

    const playerOptions = [
        { label: 'Red', value: 'red' },
        { label: 'Blue', value: 'blue' },
        { label: 'Orange', value: 'orange' },
        { label: 'Purple', value: 'purple' }
    ];

    const [availableGames, setAvailableGames] = useState([]);
    const [selectedGame, setSelectedGame] = useState();
    const [selectedPlayer, setSelectedPlayer] = useState(playerOptions[0].value);

    async function loadAvailableGames() {
        const games = await api.getGames();
        console.log(games);
        setAvailableGames(games);
    }

    useEffect(() => {
        // Load available games, reload on an interval
        loadAvailableGames();
        const interval = setInterval(() => {
            loadAvailableGames();
        }, 1000);

        // Clean up on unmount
        return () => clearInterval(interval);
    }, []);

    function handleStartGame() {
        console.log(`I want to play as ${selectedPlayer}`);

        // TODO: can ignore rejection & just carry on, taking control of the existing player!!
        // TODO: The "feature" outlined above is kinda handy for testing - hence the commented out code.
        // TODO: add auth via a randomly generated cookie, or just use the socket.io connection?
        function onAccept() {
            props.onSelect(selectedPlayer);
        }

        function onReject(text) {
            console.error(`Error: ${text}`);
            //props.onError(id);
            props.onSelect(selectedPlayer);
        }

        api.join(selectedPlayer, selectedGame, onAccept, onReject);
    }

    function handleCreateGame(name) {
        console.log(`I want to create a new game called ${name}`);

        function onAccept() {
            loadAvailableGames();
        }

        function onReject(text) {
            console.error(`Error: ${text}`);
            //props.onError(id);
        }

        const gameData = {
            'name': name
        };

        api.createGame(gameData, onAccept, onReject);
    }

    let options = [];
    for (let game of availableGames) {
        console.log(`adding game ${game.id}`);
        options.push(<Option key={game.id} value={game.id}>{game.name}</Option>);
    }

    return (
        <div>
            <Search
                placeholder="enter game name" 
                onSearch={handleCreateGame} 
                enterButton='Create Game'
            />
            <Radio.Group options={playerOptions} onChange={(e) => setSelectedPlayer(e.target.value)} value={selectedPlayer} />
            <Select
                style={{ width: 200 }}
                onChange={(value) => setSelectedGame(value)}
                placeholder='Select a game'
            >
                {options}
            </Select>
            <Button type='primary' onClick={handleStartGame} >Start Game!!!1</Button>
        </div>
    );
};
