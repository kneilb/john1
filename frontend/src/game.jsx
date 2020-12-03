import React, {useState, useEffect} from 'react';
import {useCookies} from 'react-cookie';

function Action(props) {
    return (
        <button
            id={props.id}
            type=''
            onClick={() => { props.onClick(props.id); }}>
            {props.name}
        </button>
    );
}

export default function Game(props) {

    const [canvasSource, setCanvasSource] = useState();
    const [cookies, addCookie, removeCookie] = useCookies(['player']);

    useEffect(() => {
        async function fetchData() {
            const image = await getFromServer();

            setCanvasSource(image);
        }
        fetchData();
    }, [setCanvasSource]);

    // TODO: factor out
    async function getFromServer() {
        try {
            const response = await fetch('/api/game', {
                credentials: 'include',
                method: 'get'
            });
    
            return await response.text();
        }
        catch (error) {
            console.error(`Error: ${error}`);
        }
    }

    // TODO: factor out
    async function sendToServer(key) {
        try {
            const response = await fetch('/api/game', {
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
        console.log(`click? ${id}`);

        const newSource = await sendToServer(id);

        setCanvasSource(newSource);
    }

    async function handleExit(id) {
        console.log('EXIT');

        await sendToServer('exit');
        removeCookie('player');
    }

    return (
        <div>
            <img id='canvas' alt='game goes here!' src={canvasSource} />
            <Action id='up' name='Up' onClick={handleClick} />
            <Action id='down' name='Down' onClick={handleClick} />
            <Action id='left' name='Left' onClick={handleClick} />
            <Action id='right' name='Right' onClick={handleClick} />
            <Action id='exit' name='Exit' onClick={handleExit} />
        </div>
    );
}
