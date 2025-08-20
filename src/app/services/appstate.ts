import { inject, Provider } from "@angular/core";
import { BehaviorSubject, filter, first, map, Observable, Subject, tap } from "rxjs";
import { SOURCE_FILE_PROVIDER_TOKEN, SourceFileProvider } from "./txtfileprovider";
export class AppState 
{
    sourceFileProvider: Observable<SourceFileProvider>;
    private sourceFileProviderSubject: BehaviorSubject<SourceFileProvider | undefined>;

    availableProviders : Observable<SourceFileProvider[]>;
    private availableProvidersSubject: Subject<SourceFileProvider[]> = new BehaviorSubject<SourceFileProvider[]>([]);


    constructor() {
        console.log("App initializing");
        this.sourceFileProviderSubject = new BehaviorSubject<SourceFileProvider | undefined>(undefined);
        this.sourceFileProvider = this
            .sourceFileProviderSubject
            .pipe(
                filter(w => w !== undefined)
            );

        
        var providers = inject(SOURCE_FILE_PROVIDER_TOKEN);
        this.availableProviders = this.availableProvidersSubject.asObservable();
        this.availableProvidersSubject.next(providers);

        this.tryReadSourceFileProvider();
    }

    public setSourceFileProvider(provider: SourceFileProvider | null | undefined) {
        if (!provider) {
            this.sourceFileProviderSubject.next(undefined);
            return;
        }

        localStorage.setItem("LAST_USED_PROVIDER", provider.key);
        this.sourceFileProviderSubject.next(provider);
    }

    private tryReadSourceFileProvider() {
        const lastUsedProvider = localStorage.getItem("LAST_USED_PROVIDER");
        if (!lastUsedProvider) {
            return;
        }
        this.availableProviders.pipe(
            first(),
            map(providers => {
                const provider = providers.find(w => w.key === lastUsedProvider);
                return provider
            }),
            filter(w => w !== undefined && w !== null)
        )
        .subscribe(o => {
            this.setSourceFileProvider(o);
        })
    }
}

export function provideAppState() : Provider {
    const z = {
        provide: AppState,
        multi: false
    };
    return z;
}