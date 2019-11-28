import datetime
import socketio

# create a Socket.IO server
sio = socketio.Server(async_mode='gevent', cors_allowed_origins='*')
app = socketio.WSGIApp(sio)


_LOCKED = {}


@sio.event
def connect(sid, environ):
    print('connect ', sid)


@sio.event
def disconnect(sid):
    print('disconnect ', sid)


@sio.event
def enter_room(sid, room, prev_room):
    if prev_room:
        sio.leave_room(sid, prev_room)
    sio.enter_room(sid, room)
    return True


@sio.event
def leave_room(sid, room):
    sio.leave_room(sid, room)
    return True


def lock_change(sid, room, ident, status):
    sio.emit('lock-change', {'status': status, 'id': ident},
             room=room, skip_sid=sid)


@sio.event
def get_lock(sid, room, ident):
    key = room + '___' + ident
    if key in _LOCKED:
        print('Already locked')
        return False
    _LOCKED[key] = {
        'date': datetime.datetime.utcnow(),
        'sid': sid,
    }
    print('got lock')
    lock_change(sid, room, ident, True)
    return True


@sio.event
def release_lock(sid, room, ident):
    key = room + '___' + ident
    if key not in _LOCKED:
        # Weird not locked
        print('Not locked')
        return True

    if _LOCKED[key]['sid'] == sid:
        del _LOCKED[key]
        print('lock released')
        lock_change(sid, room, ident, False)
        return True

    # Locked by another session
    print('locked by another session')
    return False


@sio.event
def obj_change(sid, room, obj):
    sio.emit('object-change', obj, room=room, skip_sid=sid)


from gevent import pywsgi
pywsgi.WSGIServer(('', 8000), app).serve_forever()
