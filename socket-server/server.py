import datetime
import socketio

# ../../env/bin/uwsgi  --http :5000 --gevent 200 --http-websockets --master
# --wsgi-file server.py --callable app

sio = socketio.Server(async_mode='gevent_uwsgi', cors_allowed_origins='*')
app = socketio.WSGIApp(sio)

_LOCKED = {}


# @sio.event
# def connect(sid, environ):
#     print('connect ', sid)
#
#
# @sio.event
# def disconnect(sid):
#     print('disconnect ', sid)


@sio.event
def set_session(sid, username):
    sio.save_session(sid, {'username': username})
    return True


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
    session = sio.get_session(sid)
    sio.emit('lock-change', {
        'status': status,
        'id': ident,
        'username': session.get('username'),
    }, room=room, skip_sid=sid)


@sio.event
def acquire_lock(sid, room, ident):
    session = sio.get_session(sid)
    key = room + '___' + ident
    if key in _LOCKED:
        return False

    _LOCKED[key] = {
        'date': datetime.datetime.utcnow(),
        'sid': sid,
    }
    lock_change(sid, room, ident, True)
    return True


@sio.event
def release_lock(sid, room, ident):
    key = room + '___' + ident
    if key not in _LOCKED:
        # Weird not locked
        return True

    if _LOCKED[key]['sid'] == sid:
        del _LOCKED[key]
        lock_change(sid, room, ident, False)
        return True

    # Locked by another session
    return False


@sio.event
def object_change(sid, room, obj):
    sio.emit('object-change', obj, room=room, skip_sid=sid)


if __name__ == "__main__":
    from gevent import pywsgi
    pywsgi.WSGIServer(('', 8111), app).serve_forever()
