import React from 'react';
import { Card, Space } from 'antd';

import CreateGame from './createGame.jsx';
import JoinGame from './joinGame.jsx';

export default function Welcome(props) {

    function onGameCreated() {
        console.log('Successfully created game!');
        // TODO: refresh JoinGame? It'll refresh itself soon, anyway.
    }

    function onGameCreationFailed(text) {
        console.error(`Error: ${text}`);
        // props.onError(id);
    }

    return (
        <div>
            <Space direction='vertical' size='middle'>
                <Card title='Create Game'>
                    <CreateGame onAccept={onGameCreated} onReject={onGameCreationFailed} />
                </Card>
                <Card title='Join Game'>
                    <Space direction='vertical' size='middle'>
                        <JoinGame onJoin={props.onJoin} onError={props.onJoinError} />
                    </Space>
                </Card>
            </Space>
        </div>
    );
};
