// import {Client as NextcloudClient, Folder, Server as NextcloudServer} from 'nextcloud-node-client';
import Client from 'nextcloud-link';
import * as fs from 'fs';
import * as path from 'path';
import * as stream from 'stream';
import env from '../env/env';

export class NextcloudManager {
  // nextcloudClient: NextcloudClient;
  // nextcloudServer: NextcloudServer;
  nextcloudClient: Client;

  constructor(serverUrl: string) {
    // this.nextcloudServer = new NextcloudServer({
    //   url: `${serverUrl.startsWith('http') ? '' : 'https://'}${serverUrl}/remote.php/webdav`,
    //   basicAuth: {
    //     username: '',
    //     password: ''
    //   }
    // })
    // this.nextcloudClient = new NextcloudClient(this.nextcloudServer);
    this.nextcloudClient = new Client({
      url: env.nextcloudUrl,
      username: env.nextcloudUsername,
      password: env.nextcloudPassword
    });
  }

  async getFileStream(filePath: string) {
    // this.getSharedFolderContent('test')
    if (!fs.existsSync(`/tmp/of testing`)) {
      fs.mkdirSync(`/tmp/of testing`, 0o0744);
    }
    let stream: stream.Writable = fs.createWriteStream(`/tmp${filePath}`);
    await this.nextcloudClient.downloadToStream(filePath, stream);
    return stream;
  }

  async getSharedFolderContent(folderToken: string) {
    try {
      // const folder: Folder = await this.nextcloudClient.getFolder('https://nextcloud.lionsarch.tamius.net/index.php/s/B4ie3n9d92zMEbR');
      // const client = await new Client({
      //   url: 'https://nextcloud.lionsarch.tamius.net/',
      //   username: 'tamius-han',
      //   password: 'isStronkPassword()?true:false'
      // });

      // client.configureOcsConnection({
      //   url: 'https://nextcloud.lionsarch.tamius.net/index.php/s/B4ie3n9d92zMEbR',
      // })

      // client.ocsConnection.request('errgg', 'res', {test: 'test'}, (error, body) => {
      //   console.log(`————————————————————\n${
      //     JSON.stringify(error, null, 2)
      //   }\n----- res body: -----\n${
      //     JSON.stringify(body, null, 2)
      //   }`);
      // });

      const share = await this.getShareByToken('B4ie3n9d92zMEbR');
      console.log(share);
      const files = await this.getFiles(share);
      console.log("files:", files)
      return files;
    } catch (e) {
      console.error('Error!', e)
    }
  }

  private async getShareByToken(token: string) {
    return (await this.nextcloudClient.shares.list()).find(x => x.token === token);
  }
  private getFiles(folder: any | string) {
    if (typeof folder === 'string') {
      console.log("NOT SUPPORTED");
    } else {
      if (folder.itemType === 'folder') {
        return this.nextcloudClient.getFiles(folder.path);
      } else {
        return folder.fileTarget;
      }
    }
  }


}