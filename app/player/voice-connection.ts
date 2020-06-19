import * as Discord from 'discord.js';

export class VoiceConnection {
  connection?: Discord.VoiceConnection | null | undefined;
  voiceChannel?: Discord.VoiceChannel | null | undefined;
  discordClient: Discord.Client;

  constructor(discordClient: Discord.Client) {
    this.discordClient = discordClient;
  }


  async connect(message: Discord.Message) {
    try {
      console.log("message:", message);
      this.voiceChannel = message.member?.voice.channel;
      if (!this.voiceChannel) {
        return message.channel.send('Connecting to voice failed: user not in channel');
      }

      const permissions = this.voiceChannel.permissionsFor(message.client.user as Discord.User);
      if (!permissions?.has("CONNECT") || !permissions?.has("SPEAK")) {
        return message.channel.send('CHECK MY PRIVILEGE! (I need permissions to access voice channel)');
      }

      this.connection = await this.voiceChannel.join();
    } catch (err) {
      console.log("error:", err)
    }
  }

  async play(message: Discord.Message, stream: any) {
    if (!this.connection) {
      this.connect(message);
    }
    const dispatcher = this.connection?.play(stream);
  }
}
