import { Routes } from '@angular/router';
import { LandingComponent } from './components/landing/landing';
import { SignupComponent } from './components/signup/signup';
import { SigninComponent } from './components/signin/signin';
import { GameRoomComponent } from './components/game/game';
import { LobbyComponent } from './components/lobby/lobby';

export const routes: Routes = [
    {
        path: '',
        component:LandingComponent
    },
    {
        path:'signup',
        component:SignupComponent
    },
    {
        path:'signin',
        component:SigninComponent
    },
    {
        path:"game",
        component:GameRoomComponent
    },
    {
        path:'lobby',
        component:LobbyComponent
    },

];
