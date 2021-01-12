import React, { useEffect, useState } from 'react';
import { Button, Radio, Select, Space } from 'antd';

// TODO: useContext
import * as api from './api';

const { Option } = Select;

export default function JoinGame(props) {

    const [availableGames, setAvailableGames] = useState([]);
    const [selectedGame, setSelectedGame] = useState();
    const [availablePlayers, setAvailablePlayers] = useState([]);
    const [selectedPlayer, setSelectedPlayer] = useState();

    async function loadAvailableGames() {
        const games = await api.getGames();
        console.log(games);
        setAvailableGames(games);

        // TODO: handle selectedGame no longer being available
        if (!selectedGame && games.length >= 1) {
            handleGameSelected(games[0].id);
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

        // We really do only want this to only run once on mount
        // eslint-disable-next-line
    }, []);

    function handleStartGame() {
        console.log(`I want to play as ${selectedPlayer}`);

        api.join(selectedPlayer, selectedGame, props.onJoin, props.onError);
    }

    function handleGameSelected(gameId) {
        setSelectedGame(gameId);
        const game = availableGames.find((g) => g.id === gameId);
        if (game) {
            setAvailablePlayers(game.players);

            if (!game.players.includes(selectedPlayer)) {
                setSelectedPlayer(game.players[0]);
            }
        }
    }

    return (
        <Space direction='vertical' size='middle'>
            <Select
                onChange={(value) => handleGameSelected(value)}
                placeholder='Select a game'
                style={{ width: 200 }}
                value={selectedGame}
            >
                {availableGames.map(({ id, name }) => <Option key={id} value={id}>{name}</Option>)}
            </Select>
            <Radio.Group name='players' onChange={(e) => setSelectedPlayer(e.target.value)} value={selectedPlayer}>
                {availablePlayers.map((id) => <Radio key={id} value={id}>{id}</Radio>)}
            </Radio.Group>
            <Button type='primary' onClick={handleStartGame}>
                Start Game!!!1
            </Button>
        </Space>
    );
}
