import { SongFileType } from '../enum/song-type.enum';

class Song {

  id: any;
  owner: any;

  type: SongFileType;
  originalPath: string;
  cachedPath?: string;
  title?: string;
  artist?: string;
  album?: string;

  franchiseTags?: string[];
  moodTags?: string[];
  genreTags?: string[];


  // static isMusicFile(fileName: string) {
  //   const [fileExt] = fileName.split('.').reverse();
  //   switch (fileExt) {
  //     case 'mp3':
  //     case 'webm':
  //     case 'wav':
  //     case 'aac':
  //     case 'mp4':
  //     case 'm4a':
  //     case 'flac':
  //     case 'opus':
  //       return true;
  //     default:
  //       return false;
  //   }
  // }




}

export default Song;
