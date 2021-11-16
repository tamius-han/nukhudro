import * as Discord from 'discord.js';

export class VoiceConnection {
  connection?: Discord.VoiceConnection | null | undefined;
  voiceChannel?: Discord.VoiceChannel | null | undefined;
  discordClient: Discord.Client;

  listeners: {[x: string]: () => any} = {};

  constructor(discordClient: Discord.Client) {
    this.discordClient = discordClient;
  }

  async connect(message: Discord.Message) {
      // console.log("message:", message);
    this.voiceChannel = message.member?.voice.channel;
    if (!this.voiceChannel) {
      message.channel.send('Connecting to voice failed: user not in channel');
      throw 'USER_NOT_IN_CHANNEL';
    }

    const permissions = this.voiceChannel.permissionsFor(message.client.user as Discord.User);
    if (!permissions?.has("CONNECT") || !permissions?.has("SPEAK")) {
      message.channel.send('CHECK MY PRIVILEGE! (I need permissions to access voice channel)');
      throw 'NO_VOICE_PERMISSION';
    }

    this.connection = await this.voiceChannel.join();
  }

  async play(message: Discord.Message, stream: any) {
    if (!this.connection) {
      try {
        this.connect(message);
      } catch (error) {
        console.error('Play failed:', message);
        throw error;
      }
    }
    const dispatcher = this.connection?.play(stream);
  }

  /**
   * Plays a file. Returns a promise that resolves when the playback is completed.
   * @param message
   * @param filePath
   */
  async playFile(message: Discord.Message, filePath: string): Promise<void> {
    if (!this.connection) {
      try {
        await this.connect(message);
      } catch (error) {
        throw error;
      }
    }

    return new Promise<void>(
      (resolve, reject) => this.connection?.play(filePath).on('finish', resolve).on('error', reject)
    );
  }


  // async playTest(message: Discord.Message, songs: string[], index: number) {
  //   if (!this.connection) {
  //     this.connect(message);
  //   }
  //   const dispatcher = this.connection?.play(songs[index]).on("finish", () => this.playTest(message, songs, (++index) % songs.length));
  //   // const dispatcher = this.connection?.play(songs[index]);
  // }

  async on(event: string, fn: () => any) {
    this.listeners['event'] = fn;
    return this;
  }
}
