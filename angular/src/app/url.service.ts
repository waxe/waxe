import { Injectable } from '@angular/core';


export const URLS: any = {
  'files': {
    'list': '',
    'view': '/edit/txt',
  },
  'versioning': {
    'status': '/versioning',
    'update': '/versioning/update',
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
  'versioning': {
    'status': `${PATH}/api/0/versioning`,
    'pull': `${PATH}/api/0/versioning/pull`,
    'commit': `${PATH}/api/0/versioning/commit`,
  }
};


@Injectable()
export class UrlService {
  URLS: any = URLS;
  API_URLS: any = API_URLS;

  previewUrl: string;
}
