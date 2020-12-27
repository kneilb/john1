import React from 'react';
import api from './api';

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

        // TODO: can ignore 409 conflict & just carry on, taking control of the existing player!!
        // TODO: The "feature" outlined above is kinda handy for testing - hence the commented out code.
        // TODO: add auth via a randomly generated cookie...!?
        try {
            api.join(id);

            // if (response.status !== 200) {
            //     console.error(`Error: ${response.statusText}`);
            //     props.onError(id);
            //     return;
            // }

            //const text = await response.text();
            //console.log(text);
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
            <Chooser id="orange" name="Fishface" onClick={handleClick} />
        </div>
    );
};
