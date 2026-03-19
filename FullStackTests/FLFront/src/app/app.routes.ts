import { Routes } from '@angular/router';
import {LandinPage} from './Pages/landin-page/landin-page';
import {LogIn} from './Pages/log-in/log-in';
import {SignIn} from './Pages/sign-in/sign-in';
import {LigaNoticias} from './Pages/liga-noticias/liga-noticias';
import {SeleccionLigas} from './Pages/seleccion-ligas/seleccion-ligas';
import {Home} from './Pages/home/home';
import {LigaClasificacion} from './Pages/liga-clasificacion/liga-clasificacion';
import {LigaMercado} from './Pages/liga-mercado/liga-mercado';
import {LigaPlantilla} from './Pages/liga-plantilla/liga-plantilla';
import {LigaWidgets} from './Pages/liga-widgets/liga-widgets';
import {Page404} from './Pages/page404/page404';
import {UserSettings} from './Pages/user-settings/user-settings';
import {DashboardLigas} from './Pages/dashboard-ligas/dashboard-ligas';
import {loginGuardGuard} from './Guards/login-guard-guard';
import { AdminConfig } from './Pages/admin-config/admin-config';
import { adminGuard } from './Guards/admin-guard';
import { LigaJugadores } from './Pages/liga-jugadores/liga-jugadores';

export const routes: Routes = [
  {path: '', pathMatch: "full", redirectTo: 'daznfantasy'},
  {path: 'daznfantasy', children: [
      {path: '', pathMatch:'full', component: LandinPage},
      {path: 'login', component: LogIn},
      {path: 'register', component: SignIn},
      {
        path: '', canActivateChild: [loginGuardGuard], children: [
          {path: 'home', component: Home},
          {path: 'news', component: LigaNoticias},
          {path: 'leagues', component: SeleccionLigas},
          {path: 'user', component: UserSettings},
          {path: 'mercado', component: LigaMercado},
          {path: 'noticias', component: LigaNoticias},
          {path: 'widgets', component: LigaWidgets},
          {path: 'admin/config', component: AdminConfig, canActivate: [adminGuard]},
          {
            path: 'liga',
            component: DashboardLigas,
            children: [
              {path: '', pathMatch: 'full', redirectTo: 'clasificacion'},
              {path: 'clasificacion', component: LigaClasificacion},
              {path: 'plantilla', component: LigaPlantilla},
              {path: 'mercado', component: LigaMercado},
              {path: 'jugadores', component: LigaJugadores},
            ],
          },
        ],
      },
    ],
  },
  {path: 'page404', component: Page404},
  {path: '**', component: Page404},
  ];
