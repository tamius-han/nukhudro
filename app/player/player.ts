import * as Discord from 'discord.js';
import { VoiceConnection } from './voice-connection';
import { NextcloudManager } from '../nextcloud/NextcloudManager';

export default class Player {
  libraryPaths: {[libName: string]: string} = {};
  private discordClient: Discord.Client;

  private voiceConnection?: VoiceConnection;
  
  private nextcloudManager: NextcloudManager;

  playlist: any[] = [];
  songQueue: any[] = [];

  constructor(discordClient: Discord.Client) {
    this.discordClient = discordClient;
    this.nextcloudManager = new NextcloudManager('');
  }

  async processCommand(message: Discord.Message, cmd: string) {
    const [command, ...args] = cmd.split(' ');
    switch (command) {
      case 'set':
        return this.setConfig(message, args);
      case 'get':
      case 'show':
        return this.getConfig(message, args);
      case 'del':
      case 'delete':
      case 'remove':
        return this.deleteConfig(message, args);
      case 'youdontwanttodothat':
      case 'youthinkyoudobutyoudont':
        return this.playRandom(message);
      default: 
        return message.channel.send(`Unknown command: \`${cmd.trim()}\``);
    }
  }

  async setConfig(message: Discord.Message, configOptions: string[]) {
    const [option, ...args] = configOptions;
    switch (option) {
      case 'lib':
      case 'library':
      case 'source':
        this.addUpdateLibrary(message, args);
    }
  }

  async getConfig(message: Discord.Message, configOptions: string[]) {
    const [option, ...args] = configOptions;
    switch (option) {
      case 'lib':
        this.listLibraries(message, args);
    }
  }

  async deleteConfig(message: Discord.Message, configOptions: string[]) {
    const [option, ...args] = configOptions;
    switch (option) {
      case 'lib':
      case 'library':
      case 'source':
        this.deleteLibrary(message, args);
    }
  }


  private async listLibraries(message: Discord.Message, configOptions: string[]) {
    if (configOptions.length === 0) {
      let libList = 'Current libraries:';
      for (const key in this.libraryPaths) {
        libList = `${libList}\n${key} -> ${this.libraryPaths[key]}`;
      }
      return message.channel.send(libList);
    } else {
      let libList = 'Library data:';
      let success = false;
      const errorKeys: any[] = [];
      for (const key in configOptions) {
        if (this.libraryPaths[key] === undefined) {
          errorKeys.push(key);
        } else {
          success = true;
          libList = `${libList}\n${key} -> ${this.libraryPaths[key]}`
        }
      }
      if (errorKeys.length === 0) {
        return message.channel.send(libList);
      }
      
      let errorList = 'You\'re also trying to discover something that doesn\'t exist. Following libraries are nowhere to be found:';
      for (const key of errorKeys) {
        errorList = `${errorList}\n  * ${key}`;
      }

      if (success) {
        return message.channel.send(`${libList}\n\n${errorList}`);
      } else {
        return message.channel.send(errorList);
      }
    }
  }

  private async addUpdateLibrary(message: Discord.Message, configOptions: string[]) {
    const [libraryName, libraryUrl] = configOptions;
    if (!libraryName || !libraryUrl ) {
      return message.channel.send('Cannot add library. libraryName or nextcloud URL are missing.');
    }

    this.libraryPaths[libraryName] = libraryUrl;
    return message.channel.send(`Added library: ${libraryName} -> ${this.libraryPaths[libraryName]}`);
  }

  private async deleteLibrary(message: Discord.Message, configOptions: string[]) {
    const [libraryName] = configOptions;
    delete this.libraryPaths[libraryName];
    return message.channel.send(`Removed library ${libraryName}`);
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

      console.log("file stream:", fileStream, fileStream.ctor);

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