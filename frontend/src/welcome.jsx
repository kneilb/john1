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

    return (
        <div>
            <Chooser id="red" name="Red" onClick={handleClick} />
            <Chooser id="green" name="Green" onClick={handleClick} />
            <Chooser id="yellow" name="Yellow" onClick={handleClick} />
            <Chooser id="blue" name="Blue" onClick={handleClick} />
            <Chooser id="orange" name="Orange" onClick={handleClick} />
        </div>
    );
};
