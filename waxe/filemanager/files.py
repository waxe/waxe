import os
import shutil


def relative_path(root_path, path):
    """Make a relative path

    :param path: the path we want to transform as relative
    :type path: str
    :param root_path: the root path
    :type root_path: str

    ;return: the relative path from given path according to root_path
    :rtype: str
    ..note:: The path should be in root_path. If it's not the case it raises
    and IOError exception.
    """
    path = os.path.normpath(path)
    root_path = os.path.normpath(root_path)
    relpath = os.path.relpath(path, root_path)
    abspath = os.path.normpath(os.path.join(root_path, relpath))
    if not abspath.startswith(root_path):
        # Forbidden path
        raise IOError("%s doesn't exist" % path)
    return relpath


def absolute_path(root_path, relpath):
    """Make an absolute relpath

    :param relpath: the relative path we want to transform as absolute
    :type relpath: str
    :param root_path: the root path
    :type root_path: str

    ;return: the absolute path from given relpath according to root_path
    :rtype: str
    """
    relpath = os.path.normpath(relpath)
    root_path = os.path.normpath(root_path)
    abspath = os.path.normpath(os.path.join(root_path, relpath))
    if not abspath.startswith(root_path):
        # Forbidden path
        raise IOError("%s doesn't exist" % relpath)
    # NOTE: symlinks are not supported
    if not (os.path.isfile(abspath) or os.path.isdir(abspath)):
        raise IOError("%s doesn't exist" % relpath)
    return abspath


def _append_file(filename, directory, lis, exts=None):
    if filename.startswith('.'):
        return
    if exts:
        _, ext = os.path.splitext(filename)
        if ext not in exts:
            return
    lis.append(os.path.join(directory, filename))


def cleanup_path(root_path, s):
    """Remove the root_path occurences from given s

    The idea is to never display the root_path to the end users.
    """
    s = s.replace('%s/' % root_path, '')
    s = s.replace('%s' % root_path, '')
    return s


def get_folders_and_files(abspath, exts=None):
    """Get all the folders and files in the given abspath

    ..note:: this is not recursive
    """
    if not os.path.isdir(abspath):
        raise IOError("Directory %s doesn't exist" % abspath)

    folders = []
    files = []

    for dirpath, dirnames, filenames in os.walk(abspath):
        dirnames.sort()
        filenames.sort()

        for d in dirnames:
            _append_file(d, dirpath, folders)

        for f in filenames:
            _append_file(f, dirpath, files, exts)

        return folders, files


def copytree(abssrc, absdst):
    """Since shutil.copytree works only when the dest folder doesn't exists, we
    implement a copy from
    https://docs.python.org/2/library/shutil.html#copytree-example
    """
    errors = []
    if os.path.islink(abssrc):
        # Don't do anything when symlink
        return
    elif os.path.isdir(abssrc):
        bname = os.path.basename(abssrc)
        if os.path.exists(os.path.join(absdst, bname)):
            errors.append('%s already exists' % (
                os.path.join(absdst, bname)))
            return errors

        os.makedirs(os.path.join(absdst, bname))
        names = os.listdir(abssrc)
        for name in names:
            errors.extend(
                copytree(os.path.join(abssrc, name),
                         os.path.join(absdst, bname)))
    else:
        new_dst = os.path.join(absdst, os.path.basename(abssrc))
        if not os.path.isdir(absdst):
            os.makedirs(absdst)
        if os.path.isfile(new_dst):
            errors.append('%s already exists' % new_dst)
        else:
            shutil.copy2(abssrc, new_dst)
    return errors
