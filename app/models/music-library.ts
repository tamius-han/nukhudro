import Song from "./song";
import LibraryManager from "../player/library-manager";
import * as fs from 'fs';
import { readJson, saveJson, rm, ensureDirSync } from "../lib/fs-helpers";
import LocalCollection from "../local-collection/local-collection";

export enum LibraryType {
  Local = 0,
  Nextcloud = 1,
}

export enum LibraryStatus {
  Error = -1,
  Ready = 0,
  Uninitialized = 1,
  Scanning = 2,
}

export default class MusicLibrary {
  libraryName: string;
  path: string;
  type: LibraryType;
  songs: Song[];
  status: LibraryStatus;

  constructor(
    path: string,
    type: LibraryType,
    name: string
  ) {
    this.libraryName = name;
    this.type = type;
    this.path = path;

    this.status = LibraryStatus.Uninitialized;

    this.songs = [];

    this.init();
  }

  async init() {
    try {
      // if library conf file exists, we read it. If library conf doesn't exist, we will create it.
      if (fs.existsSync(`${LibraryManager.libraryStoragePath}/${this.libraryName}/songs.json`)) {
        this.loadSongLibraryFromFile();
      } else {
        this.rescan();
      }
    } catch (error) {
      console.error(`Problem with initializing library: ${this.libraryName}. Error:`, error);
    }
  }

  async loadSongLibraryFromFile() {
    this.songs = (await readJson(`${LibraryManager.libraryStoragePath}/${this.libraryName}/songs.json`)).songs;
  }
  async saveSongLibraryToFile() {
    ensureDirSync(`${LibraryManager.libraryStoragePath}/${this.libraryName}/`);
    saveJson({songs: this.songs}, `${LibraryManager.libraryStoragePath}/${this.libraryName}/songs.json`);
  }
  
  /**
   * NOTE – DOES NOT DELETE CONTENTS (but cache _does_ get wiped)
   */
  async deleteLibrary() {
    // for remote kind of libraries we also clear cache
    if (this.type !== LibraryType.Local) {
      rm(`${LibraryManager.libraryCachePath}/${this.libraryName}`);
    }

    rm(`${LibraryManager.libraryStoragePath}/${this.libraryName}/songs.json`)
  }

  getShortStatus() {
    switch (this.status) {
      case LibraryStatus.Error:
        return 'err';
      case LibraryStatus.Ready:
        return 'rdy';
      case LibraryStatus.Scanning:
        return 'scn';
      case LibraryStatus.Uninitialized:
        return 'ini';
      default:
        return '???';
    }
  }

  async rescan() {

  }
}
