import React, { useEffect, useState } from 'react';
import * as api from './api';
import { Button, Radio, Select } from 'antd';

const { Option } = Select;

export default function Welcome(props) {

    const playerOptions = [
        { label: 'Red', value: 'red' },
        { label: 'Green', value: 'green' },
        { label: 'Yellow', value: 'yellow' },
        { label: 'Blue', value: 'blue' },
        { label: 'Orange', value: 'orange' }
    ];

    const [availableGames, setAvailableGames] = useState([]);
    const [selectedGame, setSelectedGame] = useState();
    const [selectedPlayer, setSelectedPlayer] = useState(playerOptions[0].value);

    useEffect(() => {
        async function onLoad() {
            const games = await api.getGames();
            console.log(games);
            setAvailableGames(games);
        }

        onLoad();

    }, []);

    function handleClick() {
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

    let options = [];
    for (let game of availableGames) {
        console.log(`adding game ${game.id}`);
        options.push(<Option key={game.id} value={game.id}>{game.name}</Option>);
    }

    return (
        <div>
            <Radio.Group options={playerOptions} onChange={(e) => setSelectedPlayer(e.target.value)} value={selectedPlayer} />
            <Select
                style={{ width: 200 }}
                onChange={(value) => setSelectedGame(value)}
                placeholder='Select a game'
            >
                {options}
            </Select>
            <Button type='primary' onClick={handleClick} >Start Game!!!1</Button>
        </div>
    );
};
