import * as Discord from 'discord.js';
import { VoiceConnection } from './voice-connection';
import { NextcloudManager } from '../nextcloud/NextcloudManager';
import LibraryManager from './library-manager';

export default class Player {
  libraryPaths: {[libName: string]: string} = {};
  private discordClient: Discord.Client;
  private voiceConnection?: VoiceConnection;
  
  private nextcloudManager: NextcloudManager;
  private libraryManager: LibraryManager;

  playlist: any[] = [];
  songQueue: any[] = [];

  constructor(discordClient: Discord.Client) {
    this.discordClient = discordClient;
    this.nextcloudManager = new NextcloudManager('');
    this.libraryManager = new LibraryManager();
  }

  async processCommand(message: Discord.Message, cmd: string) {
    const [command, ...args] = cmd.split(' ');
    switch (command) {
      case 'help': 
        return this.printHelp(message);
      case 'set':
        return this.setConfig(message, args);
      case 'get':
      case 'show':
        return this.getConfig(message, args);
      case 'del':
      case 'delete':
      case 'remove':
        return this.deleteConfig(message, args);
      case 'lib':
        return this.libraryManager.handle(message, args);
      case 'cancer':
        return this.playRandom(message);
      default: 
        return message.channel.send(`Unknown command: \`${cmd.trim()}\``);
    }
  }

  async printHelp(message: Discord.Message) {
    message.channel.send(`List of commands:
\`\`\`
help                    display this help
set <conf> <value>      set config option to value
get <conf>              get value for config option
del <conf>              remove value for config option
lib <name> ls [page]    list songs in library, 16 at a time
cancer                  gives you ear-cancer
\`\`\`
    `)
  }

  async setConfig(message: Discord.Message, configOptions: string[]) {
    const [option, ...args] = configOptions;
    switch (option) {
      case 'lib':
      case 'library':
      case 'source':
        const [name, ...path] = args;
        const url = path.join(' ');
        this.libraryManager.addUpdateLibrary(message, name, url);
    }
  }

  async getConfig(message: Discord.Message, configOptions: string[]) {
    const [option, ...args] = configOptions;
    switch (option) {
      case 'lib':
        this.libraryManager.listLibraries(message, args);
    }
  }

  async deleteConfig(message: Discord.Message, configOptions: string[]) {
    const [option, ...args] = configOptions;
    switch (option) {
      case 'lib':
      case 'library':
      case 'source':
        this.libraryManager.deleteLibrary(message, args);
    }
  }

  private async playRandom(message: Discord.Message) {
    try {
      if (!this.voiceConnection) {
        this.voiceConnection = new VoiceConnection(this.discordClient);
        await this.voiceConnection.connect(message);
      }

      const files = await this.nextcloudManager.getSharedFolderContent('test');
      const file = files[Math.floor(Math.random() * files.length)];
      console.log("picked file:", file)
      const fileStream = await this.nextcloudManager.getFileStream(`/of testing/${file}`);

      console.log("file stream:", fileStream);

      this.voiceConnection.play(message, `/tmp/of testing/${file}`);
    } catch (err) {
      console.log("error:", err)
    }
  }

  private async play(message: Discord.Message, configOptions: string[]) {
    if (!this.voiceConnection) {
      this.voiceConnection = new VoiceConnection(this.discordClient);
      await this.voiceConnection.connect(message);
    }

    // this.voiceConnection.play(fileStream)
  }
}