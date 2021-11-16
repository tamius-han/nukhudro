import * as Discord from 'discord.js';
import { VoiceConnection } from './voice-connection';
import { NextcloudManager } from '../nextcloud/NextcloudManager';
import LibraryManager from './library-manager';
import Song from '../models/song';
import { SongFileType } from '../enum/song-type.enum';
import { SongRepeatMode } from '../enum/song-repeat-mode.enum';

export default class Player {
  libraryPaths: {[libName: string]: string} = {};
  private discordClient: Discord.Client;
  private voiceConnection?: VoiceConnection;

  private nextcloudManager: NextcloudManager;
  private libraryManager: LibraryManager;

  songQueue: Song[] = [];
  songRepeatMode: SongRepeatMode = SongRepeatMode.NoRepeat;

  playLock: number = 0;

  constructor(discordClient: Discord.Client) {
    this.discordClient = discordClient;
    this.nextcloudManager = new NextcloudManager('');
    this.libraryManager = new LibraryManager();
  }

  async getCurrentQueue() {
    return this.songQueue;
  }

  async processCommand(message: Discord.Message, cmd: string) {
    const [command, ...args] = cmd.split(' ');
    switch (command) {
      case 'help':
        return this.printHelp(message);
      case 'lib':
        return this.libraryManager.handle(message, args);
      // case 'cancer':
        // return this.playRandom(message);
      case 'pregame':
        return this.play(message);
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

  private async playRandom(message: Discord.Message) {
    try {
      if (!this.voiceConnection) {
        this.voiceConnection = new VoiceConnection(this.discordClient);
        await this.voiceConnection.connect(message);
        console.info('[player::playRandom] voice connection established');
      }

      const files = await this.nextcloudManager.getSharedFolderContent('test');
      const file = files[Math.floor(Math.random() * files.length)];
      console.log("picked file:", file)
      const fileStream = await this.nextcloudManager.getFileStream(`/of testing/${file}`);

      console.log("file stream:", fileStream);

      this.voiceConnection.play(message, `/tmp/of testing/${file}`)
      this.voiceConnection.on("finish", () => this.playRandom(message));
    } catch (err) {
      console.log("error:", err)
    }
  }


  private async play(message: Discord.Message, configOptions?: string[]) {
    // console.log('requested playback with message: ', message, configOptions);

    if (!this.voiceConnection) {
      this.voiceConnection = new VoiceConnection(this.discordClient);
      try {
        await this.voiceConnection.connect(message);
        console.log('[player::play] Voice connection established');
      } catch (error) {
        console.error('Could not get voice connection', error);
      }
    }

    this.playLock++;
    const currentPlayLock = this.playLock;

    while (this.songQueue.length > 0) {

      try {
        switch (this.songQueue[0].type) {
          case SongFileType.LocalFile:
            await this.voiceConnection.playFile(message, this.songQueue[0].cachedPath ?? this.songQueue[0].originalPath);
            break;
          case SongFileType.YoutubeVideo:
            console.warn('IMPLEMENT YOUTUBE YOU TWAT');
            break;
        }
      } catch (err) {
        console.error('Could not play file', err);
      }

      console.info('song finished.');

      // before switching to next song, we need to check if the song stopped playing
      // because we tried playing a different song. In that case, we let the newer
      // iteration of the loop handle everything.
      if (currentPlayLock !== this.playLock) {
        console.warn('Another instance has been started while current song was playing. This play loop instance will now quit.', {loopId: currentPlayLock, mostRecentLoop: this.playLock});
        return;
      }

      switch (this.songRepeatMode) {
        case SongRepeatMode.NoRepeat:  // remove from queue
          this.songQueue.shift();
          break;
        case SongRepeatMode.RepeatAll: // put the first song at the end of the queue
          const currentSong = this.songQueue.shift();
          if (currentSong) {
            this.songQueue.push(currentSong);
          }
          break;
        case SongRepeatMode.RepeatSingle:
          // do nothing, repeat current song
          break;
        default:                      // we default to no repeat
          this.songQueue.shift();
      }
    }

    console.info('queue exhausted');
    // this.voiceConnection.play(fileStream)
  }
}
