import { Injectable } from '@angular/core';
import { throwError, Observable } from 'rxjs';
import { filter, first, map  } from 'rxjs/operators';

import * as socketIo from 'socket.io-client';

const SERVER_URL = 'http://127.0.0.1:8000';


@Injectable()
export class SocketService {
  private socket;

  private _lockObservable: Observable<any>;

  public initSocket(): void {
    this.socket = socketIo(SERVER_URL);
  }

  public enterRoom(room: string, previousRoom: string) {
    return new Observable<Event>(observer => {
      this.socket.emit('enter_room', room, previousRoom, (status) => {
        observer.next(status);
        observer.complete();

      });
    });
  }

  public leaveRoom(room: string) {
    return new Observable<Event>(observer => {
      this.socket.emit('leave_room', room, (status) => {
        observer.next(status);
        observer.complete();
      });
    });
  }

  public getLock(room: string, id: string) {
    return new Observable(observer => {
      this.socket.emit('get_lock', room, id, (status) => {
        observer.next(status);
        observer.complete();
      });
    });
  }

  public releaseLock(room: string, id: string) {
    return new Observable(observer => {
      this.socket.emit('release_lock', room, id, (status) => {
        observer.next(status);
        observer.complete();
      });
    });
  }

  public onLockChange() {
    return new Observable(observer => {
      this.socket.on('lock-change', (dict) => {
        observer.next(dict);
      });
    });
  }

  public objectChange(room: string, obj: any) {
    this.socket.emit('obj_change', room, obj);
  }

  public onObjectChange() {
    return new Observable(observer => {
      this.socket.on('object-change', (obj) => {
        observer.next(obj);
      });
    });
  }
}
