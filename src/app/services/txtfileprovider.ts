import { Injectable, InjectionToken, Provider } from "@angular/core";
import { DropboxFileProvider } from "./DropboxFileProvider";
import { Observable } from "rxjs";

export interface SourceFileProvider {
    provide(): Observable<string | null>;
    save(tasksString: string): Observable<void>;
    key: string;
    name: string;
}

export const SOURCE_FILE_PROVIDER_TOKEN = new InjectionToken<SourceFileProvider[]>("sourceFileProviderToken");

export function AddDropboxFileProvider() : Provider {
    return [
        {
        provide: SOURCE_FILE_PROVIDER_TOKEN,
        useClass: DropboxFileProvider,
        multi: true
        },
        {
            provide: DropboxFileProvider
        }
    ]
}

export class FakeFileProvider implements SourceFileProvider {
    name: string = "Fake";
    key: string = "FAKE_FILE_PROVIDER"
    provide(): Observable<string | null> {
        throw new Error("Fake provides nothing")
    }
    save(): Observable<void> {
        throw new Error("Fake provider cannot save")
    }
}

export function AddFakeFileProvider(): Provider {
    return {
        provide: SOURCE_FILE_PROVIDER_TOKEN,
        useClass: FakeFileProvider,
        multi: true
    }
}