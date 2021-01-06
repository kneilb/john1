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
    const [selectedPlayer, setSelectedPlayer] = useState(playerOptions[0].value);

    useEffect(() => {
        async function onLoad() {
            const games = await api.getGames();
            console.log(games);
            setAvailableGames(games);
        }

        onLoad();

    }, []);

    function handleClick(id) {
        console.log(`I want to play as ${id}`);

        // TODO: can ignore rejection & just carry on, taking control of the existing player!!
        // TODO: The "feature" outlined above is kinda handy for testing - hence the commented out code.
        // TODO: add auth via a randomly generated cookie, or just use the socket.io connection?
        function onAccept(text) {
            props.onSelect(id);
        }

        function onReject(text) {
            console.error(`Error: ${text}`);
            //props.onError(id);
            props.onSelect(id);
        }

        api.join(id, onAccept, onReject);
    }

    let options = [];
    for (let game of availableGames) {
        console.log(`adding game ${game.id}`);
        options.push(<Option key={game.id} value={game.id}>{game.name}</Option>);
    }

    return (
        <div>
            <Radio.Group options={playerOptions} onChange={(e) => { setSelectedPlayer(e.target.value); }} value={selectedPlayer} />
            <Select
                showSearch
                style={{ width: 200 }}
                placeholder='Select a game'
                filterOption={(input, option) =>
                    option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
            >
                {options}
            </Select>
            <Button type='primary' onClick={() => { handleClick(selectedPlayer) }} >Start Game!!!1</Button>
        </div>
    );
};
