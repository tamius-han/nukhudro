import MusicLibrary, { LibraryType } from "../models/music-library";
import * as fs from 'fs';
import env from "../env/env";
import { ensureDirSync, readJson, saveJson } from "../lib/fs-helpers";
import * as Discord from 'discord.js';
import LocalCollection from "../local-collection/local-collection";

export default class LibraryManager {
  static libraryStoragePath: string = `${env.localDataDir}/music-libraries`;
  static libraryCachePath: string = `${env.cacheDir}/music-libraries`;

  libraries: {[name: string]: MusicLibrary} = {};

  constructor() {
    console.log('IN LIBRARY MANAGER CONSTRUCTOR');
    this.initLibraries();
  }

  async initLibraries() {
    // ensure library data exists
    ensureDirSync(LibraryManager.libraryStoragePath);
    console.log(`Checking if file "${LibraryManager.libraryStoragePath}/libraries.json" exists:`);
    if (fs.existsSync(`${LibraryManager.libraryStoragePath}/libraries.json`)) {
      console.log('It does.');
      try {
        const libs = (await readJson(`${LibraryManager.libraryStoragePath}/libraries.json`)).libraries;
        for (const l in libs) {
          this.libraries[l] = this.createLibrary(libs[l].libraryName, libs[l].path, libs[l].type);
        }
      } catch (e) {
        console.error('Error reading library file. It might be corrupted.', e);
      }
    } else {
      console.log('It doesn\'t.');
    }
  }

  async listLibraries(message: Discord.Message, configOptions: string[]) {
    // get longest name length for padding later
    let longestName = 0;
    let libraryCount = 0;
    for (const l in this.libraries) {
      libraryCount++;
      if (l.length > longestName) {
        longestName = l.length;
      }
    }

    let libList = 'Current libraries:\n```\n';

    if (libraryCount === 0) {
      libList += 'No libraries are set.';
    }
    for (const l in this.libraries) {
      libList += `  × ${l.padEnd(longestName)} -> [${this.libraries[l]?.getShortStatus()}] ${this.libraries[l].path} (${this.libraries[l].songs.length} songs)\n`
    }
    libList += '```';

    return message.channel.send(libList);
  }

  async addUpdateLibrary(message: Discord.Message, libraryName: string, libraryUrl: string) {
    // if library already exists, we check whether anything is actually changing:
    if (this.libraries[libraryName]?.path === libraryUrl) {
      return;
    } else if (this.libraries[libraryName]) {
      await this.deleteLibrary(message, libraryName);
    }

    try {
      this.libraries[libraryName] = this.createLibrary(libraryName, libraryUrl);
      saveJson({libraries: this.libraries}, `${LibraryManager.libraryStoragePath}/libraries.json`);
    } catch (err) {
      console.error('[LibraryManager::addUpdateLibrary] failed to create library. Error:', err);
      message.channel.send(`Failed to add new library. Error:\n\`\`\`json\n${JSON.stringify(err, null, 2)}\n\`\`\``);
    }

    return message.channel.send(`Added library: ${libraryName} -> [${this.libraries[libraryName].getShortStatus()}] ${this.libraries[libraryName].path}`);
  }

  async handle(message: Discord.Message, args: string[]) {
    const [command, ...commandOptions] = args;
    
    switch (command) {
      case 'ls':
        this.listLibraries(message, []);
    }
  }

  async deleteLibrary(message: Discord.Message, libraryName: string) {
    try {
      this.libraries[libraryName].deleteLibrary();
    } catch (e) {
      console.warn('[LibraryManager::deleteLibrary] Problem deleting existing library. Maybe it doesn\'t exist (not an error), maybe it\'s something else.', e)
    }
    delete this.libraries[libraryName];
    return message.channel.send(`Removed library ${libraryName}`);
  }

  private createLibrary(libraryName: string, path: string, type?: LibraryType) {
    // if type is missing, we auto-determine it:
    if (!type) {
      if (!path.startsWith('http://') && !path.startsWith('https://')) {
        type = LibraryType.Local;
      } else {
        type = LibraryType.Nextcloud;
      }
    }

    switch (type) {
      case LibraryType.Local:
        return new LocalCollection(path, libraryName);
      default:
        throw new Error('Unknown library type.');
    }
  }
}
