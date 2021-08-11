
import React, { Component } from 'react'
import {commands, sendCommand} from './arduino'
import { CssBaseline, Typography } from '@material-ui/core';
import MainGUI from './MainGUI';
import 'bootstrap/dist/css/bootstrap.min.css';
import {serverAddress, serverPort} from 'projectConfig'

const wurl = `${serverAddress}:${serverPort}`;
var wsocket = new WebSocket(`ws://${wurl}`);
wsocket.binaryType = "arraybuffer";
export default class App extends Component 
{
    constructor(props)
    {
        super(props);
        this.state = {
            isClientConnected: false,
            isAllowed: false,
            isArduinoConnected: false
        };
    }
    componentDidMount()
    {
        wsocket.onopen = (event) => {
            this.setState({isClientConnected: true});
            //Send Reset State command
            console.log("[Client] Successfully connected to Node.js server.");
            sendCommand(wsocket, 0, commands.reset);
        };
        wsocket.onclose = (event) =>{
            this.setState({isClientConnected: false});
            console.log("[Client] Lost connection to Node.js server");
        }
        wsocket.onmessage = (msg) => {
            if(parseInt(msg.data) === 1){
                this.setState({isArduinoConnected: true});
            }
            else{

                this.setState({isArduinoConnected: false});
            }
        }
    }

    componentWillUnmount(){
        wsocket.close();
    }

    arduinoReconnect(){
        console.log("clicked");
    }
    render() 
    {
        const isConnected = this.state.isClientConnected;
        const connectionStatus = isConnected ? "Connected" : "Not Connected";
        let InnerApp;
        if(isConnected)
        {
            if(this.state.isArduinoConnected){
                InnerApp = <MainGUI wsocket={wsocket}/>;
                
            }
            else{
                InnerApp = (
                    <div>

                    <p>Error: Arduino ONE seems to be disconnected. Make sure the right port number is set on projectConfig.js</p>
                    </div>
                );
            }
        }
        else{
            InnerApp = <p>Unable to connect to Node.js server.</p>
        }
        
        return (
            <div>
            <CssBaseline/>
            <Typography variant="h6">
            Node.js server status: {connectionStatus}
            </Typography>
                {InnerApp}
            </div>
        )
    }
}
