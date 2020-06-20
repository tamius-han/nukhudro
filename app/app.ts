import * as Discord from 'discord.js';
import Player from './player/player';
import env from './env/env';
import { ensureDirSync } from './lib/fs-helpers';

// prepare app directories:
ensureDirSync(env.localDataDir);
ensureDirSync(env.cacheDir);

const client = new Discord.Client();
const player = new Player(client);

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
      player.processCommand(message, message.content.substring(p.length).trim());
    };
  }  

});

client.login(env.token);