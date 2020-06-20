export default class Song {

  static isMusicFile(fileName: string) {
    const [fileExt] = fileName.split('.').reverse();
    switch (fileExt) {
      case 'mp3':
      case 'webm':
      case 'wav':
      case 'aac':
      case 'mp4':
      case 'm4a':
      case 'flac':
      case 'opus':
        return true;
      default:
        return false;
    }
  }

  name: string;
  fullPath: string;
  title?: string;
  artist?: string;
  album?: string;

  constructor(
    name: string,
    fullPath: string,
    title?: string,
    artist?: string,
    album?: string,
  ) {
    this.name = name;
    this.fullPath = fullPath,
    this.title = title,
    this.artist = artist,
    this.album = album
  }
}