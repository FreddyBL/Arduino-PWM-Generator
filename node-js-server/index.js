// Constants:
const aJSON_Parse = require("async-json-parse");
const WebSocket = require("ws");
const Ready = require("@serialport/parser-ready");
const SerialPort = require("serialport");
const {arduinoPort, serverAddress, serverPort} = require('projectConfig.js')


const ServerCfg = {
  ArduinoConnected: false,
  serialPort: arduinoPort,
  ArduinoAckMsg: "READY",
  MsgStartByte: 48,
  wsocketAdrr: serverAddress,
  wsocketPort: serverPort,
  wsList: new Set(),
};
const sport = new SerialPort(ServerCfg.serialPort, { autoOpen: false });

sport.open((error) => {
  if (error) {
    console.log("[Arduino] Could not connect to Arduino. ");
  }
});

const parser = sport.pipe(new Ready({ delimiter: ServerCfg.ArduinoAckMsg }));

const sendArduinoStatus = (ws) => {
	const msg = ServerCfg.ArduinoConnected ? "1" : "0"; // Will change later
  	ws.send(msg);
};

const sendAllArduinoStatus = () =>
{
	for(let ws of ServerCfg.wsList){
		sendArduinoStatus(ws);
	}
}
parser.on("ready", () => {
  console.log("[Server] Connection to Arduino established.");
  ServerCfg.ArduinoConnected = true;
  sendAllArduinoStatus();
});

sport.on("close", () => {
	ServerCfg.ArduinoConnected = false;
  	sendAllArduinoStatus();
});

const wss = new WebSocket.Server({ host: ServerCfg.wsocketAddr,  port: ServerCfg.wsocketPort });
wss.binaryType = "arraybuffer";

wss.on("connection", (ws) => {
	ServerCfg.wsList.add(ws);
	sendArduinoStatus(ws);
  	ws.on("message", (msg) => {
    aJSON_Parse(msg).then((msg) => {
      let { pin, cmd, args } = msg;
      let bytes = [];
      bytes.push(pin, cmd);
      args.forEach((el) => {
        let argsBytes = [];
        argsBytes[0] = el & 0xff;
        argsBytes[1] = (el >> 8) & 0xff;
        argsBytes[2] = (el >> 16) & 0xff;
        argsBytes[3] = (el >> 24) & 0xff;
        argsBytes.forEach((byte) => {
          bytes.push(byte);
        });
      });
      writeBytes(sport, bytes);
    });
  });
  ws.on("close", () => {
	ServerCfg.wsList.delete(ws);
  });
});

function writeBytes(sport, bytes) {
  const len = bytes.length;
  let bytesToWrite = new Uint8Array(len + 3);
  bytesToWrite[0] = ServerCfg.MsgStartByte;
  bytesToWrite[1] = len;
  for (let i = 2, j = len + 2; i < j; i++) {
    bytesToWrite[i] = bytes[i - 2];
  }
  sport.write(Buffer.from(bytesToWrite), "binary");
}
