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

    async function handleClick(id) {
        console.log(`I want to play as ${id}`);

        // TODO: could ignore 409 conflict & just carry on, taking control of the existing player!!
        // add auth via a randomly generated cookie, not just the player ID...!?
        try {
            const response = await fetch('/api/player', {
                credentials: 'include',
                method: 'post',
                headers: { 'Content-Type': 'text/plain' },
                body: id
            });
    
            const text = await response.text();
            console.log(text);
            props.onSelect(id);
        }
        catch (error) {
            console.error(`Error: ${error}`);
            props.onError(id);
        }
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
