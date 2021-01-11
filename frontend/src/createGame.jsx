import { Input } from 'antd';

// TODO: useContext
import * as api from './api';

const { Search } = Input;

export default function CreateGame(props) {

    function handleCreateGame(name) {
        console.log(`I want to create a new game called ${name}`);

        const gameData = {
            'name': name
        };

        api.createGame(gameData, props.onAccept, props.onReject);
    }

    return <Search
        enterButton='Create Game'
        onSearch={handleCreateGame}
        placeholder='Enter game name'
        style={{ width: 300 }}
    />;
}
