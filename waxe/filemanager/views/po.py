import base64
import json
import hashlib
import os
import polib
import re
import pyramid.httpexceptions as exc
from pyramid.view import view_config

from .base import BaseGetView, BasePostView


CONTEXT_SEPARATOR = "\x04"


def get_unique_id(entry):
    def to_hash(txt):
        return base64.b64encode(hashlib.md5(txt.encode('utf-8')).digest())

    if not entry.msgctxt:
        return to_hash(entry.msgid)

    key = u'%s%s%s' % (entry.msgctxt, CONTEXT_SEPARATOR, entry.msgid)
    return to_hash(key)


class PoGetFileView(BaseGetView):

    @view_config(route_name='po', request_method='GET')
    def get(self):
        if not os.path.isfile(self.abspath):
            raise exc.HTTPNotFound()

        po = polib.pofile(self.abspath)
        entries = []
        for entry in po:
            entries.append({
                'id': get_unique_id(entry),
                'msgctxt': entry.msgctxt,
                'msgid': entry.msgid,
                'msgstr': entry.msgstr,
            })
        return entries


class PoPostFileView(BasePostView):

    @view_config(route_name='po', request_method='PUT')
    def put_po_file(self):
        if not os.path.isfile(self.abspath):
            raise exc.HTTPNotFound()

        posted_entry = self.request.json_body.get('entry')
        po = polib.pofile(self.abspath)
        for entry in po:
            if get_unique_id(entry) == posted_entry['id']:
                entry.msgstr = posted_entry['msgstr']
                break
        # TODO: raise exception if entry no found
        po.save(self.abspath)
        mo_abspath = os.path.splitext(self.abspath)[0] + '.mo'
        po.save_as_mofile(mo_abspath)
        return {}


def includeme(config):
    config.add_route('po', '/api/0/files/t/po')
