export class File {
  name: string;
  path: string;
  type: "file" | "folder";

  constructor(file: {}) {
    this.name = file['name'];
    this.path = file['path'];
  }
}


export class Folder extends File {}
