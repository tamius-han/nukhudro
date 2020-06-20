import MusicLibrary, { LibraryType, LibraryStatus } from "../models/music-library";
import * as fs from 'fs';
import * as Discord from 'discord.js';
import { ls } from "../lib/fs-helpers";
import Song from "../models/song";
import LibraryManager from "../player/library-manager";

export default class LocalCollection extends MusicLibrary {
  
  constructor(
    path: string,
    name: string
  ) {
    super(path, LibraryType.Local, name);
  }

  async rescan(message?: Discord.Message) {
    this.status = LibraryStatus.Scanning;

    // check if this is indeed a folder, otherwise throw an error
    try {
      if (fs.lstatSync(this.path).isDirectory()) {
        await this.scanDirectory(this.path);
        this.saveSongLibraryToFile();
      } else {
        console.error('[LocalCollection::rescan] The library path is not a directory.', fs.lstatSync(this.path));
        if (message) {
          message.channel.send(`**[LocalCollection::rescan]** The library path is not a directory. Further info:\n\n\`\`\`json\n${JSON.stringify(fs.lstatSync(this.path), null, 2)}\n`);
        }
        this.status = LibraryStatus.Error;
      }
    } catch (error) {
      console.error('[LocalCollection::rescan] The library path probably doesn\'t exist.', error);
      if (message) {
        message.channel.send(`**[LocalCollection::rescan]** The library path probably doesn't exist. Further info:\n\n\`\`\`json\n${JSON.stringify(error, null, 2)}\n`);
      }
      this.status = LibraryStatus.Error;
    }

    this.status = LibraryStatus.Ready;
  }

  async scanDirectory(path: string) {
    const files = await ls(path);

    for (const file of files) {
      const filePath = `${path}/${file}`;
      try {
        if (fs.lstatSync(filePath).isDirectory()) {
          await this.scanDirectory(filePath);
        } else {
          if (fs.lstatSync(filePath).isFile() && Song.isMusicFile(file)) {
            this.songs.push(new Song(file, filePath));
          }
        }
      } catch (err) {
        console.error(`[Local Collection::scanDirectory] error when scanning/processing file '${filePath}'.`);
      }
    }
  }
}
