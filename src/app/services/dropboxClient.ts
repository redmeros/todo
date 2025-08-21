// src/app/services/DropboxClient.ts
export interface UploadArgs {
  path: string;
  contents: Blob | string | ArrayBuffer;
  mode?: { ".tag": "add" | "overwrite" | "update" };
  autorename?: boolean;
  mute?: boolean;
}

export interface ListFolderArgs {
  path: string;             // Folder path in Dropbox
  recursive?: boolean;      // List recursively
  limit?: number;           // Max number of entries
  include_media_info?: boolean;
  include_deleted?: boolean;
  include_has_explicit_shared_members?: boolean;
}

export interface DownloadArgs {
  path: string; // File path in Dropbox
}

export class DropboxClient {
  private accessToken: string;
  private contentBase = 'https://content.dropboxapi.com/2';

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  // Upload a file
  async filesUpload(args: UploadArgs): Promise<any> {
    const { path, contents, mode = { ".tag": "add" }, autorename = false, mute = false } = args;

    let body: BodyInit;
    if (typeof contents === 'string') {
      body = new TextEncoder().encode(contents);
    } else {
      body = contents;
    }

    const res = await fetch(`${this.contentBase}/files/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Dropbox-API-Arg': JSON.stringify({ path, mode, autorename, mute }),
        'Content-Type': 'application/octet-stream'
      },
      body
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Dropbox upload error: ${res.status} ${text}`);
    }

    return res.json();
  }

  async filesListFolder(args: ListFolderArgs): Promise<any> {
  const {
    path,
    recursive = false,
    limit,
    include_media_info = false,
    include_deleted = false,
    include_has_explicit_shared_members = false
  } = args;

  const body: any = { path, recursive, include_media_info, include_deleted, include_has_explicit_shared_members };
  if (limit) body.limit = limit;

  const res = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const text = await res.text();
    throw {
        message: `Dropbox list_folder error: ${res.status} ${text}`,
        status: res.status
    };
  }

  return res.json();
}

async filesDownload(args: DownloadArgs): Promise<Blob> {
  const { path } = args;

  const res = await fetch('https://content.dropboxapi.com/2/files/download', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${this.accessToken}`,
      'Dropbox-API-Arg': JSON.stringify({ path })
    }
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Dropbox download error: ${res.status} ${text}`);
  }

  // Return as Blob for easy usage in Angular
  return await res.blob();
}

// Inside DropboxClient class
async checkUser(): Promise<{status: number}> {
        const res = await fetch('https://api.dropboxapi.com/2/users/get_current_account', {
            method: 'POST',
            headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
            }
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Dropbox checkUser error: ${res.status} ${text}`);
        }

        return {status: res.status};
    }


}
