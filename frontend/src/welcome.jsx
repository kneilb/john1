import React from 'react';

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

    // TODO: factor out
    async function sendToServer(key) {
        try {
            const response = await fetch('/', {
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

        sendToServer(id);
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
