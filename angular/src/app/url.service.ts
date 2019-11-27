import { Injectable } from '@angular/core';


export const URLS: any = {
  'files': {
    'list': '',
    'view': '/edit/txt',
    'po': '/edit/po',
  },
  'versioning': {
    'status': '/versioning',
    'update': '/versioning/update',
  },
  'auth': {
    'login': '/login',
  }
};


// Development path
const PATH = '';

export const API_URLS: any = {
  'files': {
      'all': `${PATH}/api/0/files/all`,
      'list': `${PATH}/api/0/files`,
      'source': `${PATH}/api/0/files/source`,
      'folder': `${PATH}/api/0/files/folder`,
      'rename': `${PATH}/api/0/files/rename`,
      'copy': `${PATH}/api/0/files/copy`,
      'move': `${PATH}/api/0/files/move`,
      'po': `${PATH}/api/0/files/t/po`,
  },
  'versioning': {
    'status': `${PATH}/api/0/versioning`,
    'branches': `${PATH}/api/0/versioning/branches`,
    'pull': `${PATH}/api/0/versioning/pull`,
    'commit': `${PATH}/api/0/versioning/commit`,
    'check': `${PATH}/api/0/versioning/check`,
  },
  'auth': {
    'login': `${PATH}/api/0/auth/login`,
    'logout': `${PATH}/api/0/auth/logout`,
  },
};


@Injectable()
export class UrlService {
  URLS: any = URLS;
  API_URLS: any = API_URLS;

  previewUrl: string;
}
