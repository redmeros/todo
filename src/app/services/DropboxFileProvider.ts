import { HttpClient } from "@angular/common/http";
import { inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { catchError, concatMap, from, map, mergeMap, Observable, of, retry, tap } from "rxjs";
import { DropboxToken } from "../components/auth-callback-component/auth-callback-component";
import { SourceFileProvider } from "./txtfileprovider";
import { DropboxClient } from "./dropboxClient";

export class DropboxFileProvider implements SourceFileProvider {
    name: string = "Dropbox";
    key: string = "DROPBOX_FILE_PROVIDER";
    clientId = "mq0ijugey03698h";

    dropboxKey: string;

    private httpClient: HttpClient;
    private route: ActivatedRoute;

    constructor() {
        this.httpClient = inject(HttpClient);
        this.route = inject(ActivatedRoute);

        console.log("Creating new dropbox provider");
        this.dropboxKey = this.readDropboxKey();
    }

    save(tasksString: string): Observable<void> {
        const token = this.readDropboxKey();
        const dbx = new DropboxClient(token);
        const blob = new Blob([tasksString], { type: 'text/plain' });

        return from(dbx.filesUpload({
            path: '/todo.txt',
            autorename: false,
            contents: blob,
            mode: { ".tag": "overwrite" }
        })).pipe(
            tap(() => {
                this.logaswarn("File uploaded to dropbox")
            }),
            map(() => {
                return undefined;
            })
        );
    }

    private readDropboxKey(): string {
        const dropboxKey = localStorage.getItem("DROPBOX_ACCESS_TOKEN");
        if (dropboxKey === null || dropboxKey.length === 0) {
            return "";
        }
        return dropboxKey;
    }


    provide(): Observable<string> {
        const key = this.readDropboxKey();
        const dbx = new DropboxClient(key);
        if (!key) {
            this.performLoginOAuth();
        }

        return from(dbx.filesListFolder({
            path: ""
        }))
            .pipe(
                catchError(err => {
                    console.log(err.status);
                    const z = this
                        .tryRefreshToken()
                        .pipe(
                            concatMap(x => {
                                if (x === true) {
                                    return from(dbx.filesListFolder({ path: "" }))
                                } else {
                                    // tutaj jest przekierowanie na strone dropboxa...
                                    this.performLoginOAuth();
                                    throw "user not logged in";
                                }
                            })
                        );
                    return z;
                }),
                mergeMap(x => {
                    const f = x.entries.find((w: { name: string; }) => w.name === "todo.txt");
                    console.warn(f?.path_lower);
                    if (f === null || f === undefined) {
                        throw "not implemented 2"
                    }
                    return from(dbx.filesDownload({ path: f.path_lower ?? "" }))
                }),
                mergeMap(async blob => {
                    const txt = await blob.text();
                    return txt as string;
                })

            );
    }

    isLoggedIn(): Observable<boolean> {
        const accessToken = this.readDropboxKey();

        if (!accessToken) {
            return of(false);
        }

        const dbx = new DropboxClient(accessToken);

        const x = from(dbx.checkUser())
            .pipe(
                catchError(err => {

                    if (err.status === 200)
                        return of({ status: 200 })
                    return of({ status: 0 })
                }),
                map(r => {
                    if (r.status === 200) {
                        return true;
                    } else {
                        return false;
                    }
                })
            );
        return x.pipe(
            catchError(() => {
                return this.tryRefreshToken();
            })
        );
    }

    performLoginOAuth() {
        const clientId = this.clientId;
        const redirectUri = "http://localhost:4200/auth/callback";
        const authUrl = `https://www.dropbox.com/oauth2/authorize?token_access_type=offline&response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;
        window.location.href = authUrl;
    }

    readRefreshToken(): string | null {
        this.logaswarn("Refreshing token")
        const str = localStorage.getItem("DROPBOX_REFRESH_TOKEN");
        if (str === null)
            return null;

        if (!str)
            return null;
        return str;
    }

    tryRefreshToken(): Observable<boolean> {
        const data = this.readRefreshToken();
        const url = "http://localhost:3000/api/dropbox/refresh"
        return this.httpClient.post<DropboxToken>(url, { refresh_token: data }).pipe(
            tap(dbToken => {
                console.log(`Got db token: `, dbToken);
            }),
            map(dbToken => {
                localStorage.setItem("DROPBOX_ACCESS_TOKEN_DATA", JSON.stringify(dbToken));
                localStorage.setItem("DROPBOX_ACCESS_TOKEN", dbToken.access_token);
                return true;
            }),
            catchError(() => {
                return of(false);
            }),
        );

    }

    logaswarn(message?: unknown, ...params: unknown[]) {
        if (!message) {
            message = "";
        }
        message = "DropboxFileProvider: " + message;
        console.warn(message, params);
    }
}


export interface WithFileBlob {
    fileBlob: Blob
}