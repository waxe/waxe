import os
import re


EDITOR_PATH = 'http://w.w/edit/txt?path='

django_include_re = re.compile(r'{% *include "(?P<url>.*?)" *%}')
html_include_re = re.compile(r'<include src="%s(?P<url>.*?)" *>' %
                             re.escape(EDITOR_PATH))


def before_replacer(match):
    return '<include src="%s%s">' % (EDITOR_PATH, match.group('url'))


def after_replacer(match):
    return '{%% include "%s" %%}' % match.group('url')


def is_django(abspath):
    return os.path.splitext(abspath)[1] == '.html'


def before_edit(abspath, s):
    if is_django:
        return django_include_re.sub(before_replacer, s)
    return s


def after_edit(abspath, s):
    if is_django:
        return html_include_re.sub(after_replacer, s)
    return s
