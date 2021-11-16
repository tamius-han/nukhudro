import * as Discord from 'discord.js';
import Player from './player/player';
import env from './env/env';
import express from 'express';
import { ensureDirSync } from './lib/fs-helpers';

// prepare app directories:
console.log('---------- starting app! ------------------');

ensureDirSync(env.localDataDir);
ensureDirSync(env.cacheDir);

const client = new Discord.Client();
const player = new Player(client);
const app = express();


//#region discord stuffs
client.once('ready', () => {
  console.log('Client ready.');
})
client.once('error', (e) => {
  console.log('There\'s been an error:', e);
})
client.once('disconnect', () => {
  console.log('Client disconnected.');
})

// process message
client.on('message', async message => {
  if (message.author.bot) {
    return;
  }

  for (const p of env.prefixes) {
    if (message.content.startsWith(p)) {
      console.log('Got command:', message.content, 'from user:', message.author);
      player.processCommand(message, message.content.substring(p.length).trim());
    };
  }

});

client.login(env.token);
//#endregion

//#region API stuffs
app.get('/api/playlists', async (request, response) => {
  // response.send(player.getPlaylists());
});

app.get('/api/playback', (request, response) => {

  response.send(
    {
      queue: player.getCurrentQueue()
    }
  );
})

//#endregion
