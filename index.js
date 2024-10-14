const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('colyseus');
const { monitor } = require('@colyseus/monitor');
const { GameRoom } = require('./GameRoom');

const app = express();
const PORT=process.env.PORT || 3000
const server = http.createServer(app);
const colyseusServer = new Server({
  server,
});

app.use(cors());

colyseusServer.define('game_room', GameRoom);

app.use('/colyseus', monitor());

app.get('/',(req,res)=>{
  res.send('colyseusServer')
})

colyseusServer.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
