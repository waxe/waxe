import os
import shutil
import tempfile
import unittest

from git import Repo


class BaseGitRepo(unittest.TestCase):

    def setUp(self):
        self.directory = tempfile.mkdtemp()
        # Create a repository like this:
        #
        # D  file0.txt
        # M  file1.txt
        # T  file2.txt
        # A  file3.txt
        # ?? file4.txt
        self.repo = Repo.init(self.directory)

        for n in range(5):
            basename = 'file%i.txt' % n
            filename = '%s/%s' % (self.directory, basename)
            with open(filename, 'w') as f:
                f.write('Hello %i' % n)

            if n < 4:
                self.repo.git.add(basename)
            if n < 3:
                self.repo.git.commit(
                    '-m', 'Add %s' % basename,
                    author='Tester <tester@lereskp.fr>',
                    *[basename])
            if n == 0:
                # file0.text: deleted D
                self.repo.git.rm(basename)
            if n == 1:
                # file1.txt: modified M
                with open(filename, 'w') as f:
                    f.write('Hello world %i' % n)
            if n == 2:
                # file2.txt: type changed T
                self.repo.git.rm(basename)
                os.symlink('%s/file1.txt' % self.directory, filename)
                self.repo.git.add(basename)

    def tearDown(self):
        shutil.rmtree(self.directory)
