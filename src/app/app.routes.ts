import { Routes } from '@angular/router';
import { Mainview } from './views/mainview/mainview';
import { AuthCallbackComponent } from './components/auth-callback-component/auth-callback-component';

export const routes: Routes = [
    {
        path: "auth/callback",
        component: AuthCallbackComponent
    },
    {
        path: "**",
        component: Mainview
    }
];
