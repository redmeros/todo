import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { AddDropboxFileProvider, AddFakeFileProvider } from './services/txtfileprovider';
import { provideAppState as AddAppState } from './services/appstate';
import { provideHttpClient } from '@angular/common/http';
import { AddTaskDateDateAdapter } from './services/dateAdapter';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideHttpClient(),
    provideRouter(routes), 
    provideClientHydration(withEventReplay()),
    AddTaskDateDateAdapter(),
    AddDropboxFileProvider(),
    AddFakeFileProvider(),
    AddAppState(),
  ]
};