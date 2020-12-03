import React from 'react';
import {useCookies} from 'react-cookie';

function Chooser(props) {
    return (
        <button
            id={props.id}
            type=""
            onClick={() => { props.onClick(props.id); }}>
            {props.name}
        </button>
    );
}

export default function Welcome(props) {

    const [cookies, addCookie, removeCookie] = useCookies(['player']);

    // TODO: factor out
    async function choosePlayer(key) {
        try {
            const response = await fetch('/api/player', {
                credentials: 'include',
                method: 'post',
                body: key
            });
    
            return await response.text();
        }
        catch (error) {
            console.error(`Error: ${error}`);
        }
    }

    async function handleClick(id) {
        console.log(`I chose to play as ${id}`);

        await choosePlayer(id);
        addCookie('player', id);
    }

    return (
        <div>
            <Chooser id="red" name="Red" onClick={handleClick} />
            <Chooser id="green" name="Green" onClick={handleClick} />
            <Chooser id="yellow" name="Yellow" onClick={handleClick} />
            <Chooser id="blue" name="Blue" onClick={handleClick} />
        </div>
    );
};
