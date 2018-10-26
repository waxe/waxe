import { Injectable } from '@angular/core';


export const URLS: any = {
  'files': {
    'list': '',
    'view': '/edit/txt',
  }
};


// Development path
const PATH = 'http://127.0.0.1:6543';

export const API_URLS: any = {
  'files': {
      'list': `${PATH}/api/0/files`,
      'source': `${PATH}/api/0/files/source`,
      'folder': `${PATH}/api/0/files/folder`,
      'rename': `${PATH}/api/0/files/rename`,
      'copy': `${PATH}/api/0/files/copy`,
      'move': `${PATH}/api/0/files/move`,
  },
};


@Injectable()
export class UrlService {
  URLS: any = URLS;
  API_URLS: any = API_URLS;

  previewUrl: string;
}
