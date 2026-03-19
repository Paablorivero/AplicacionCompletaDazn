import {CanActivateFn, Router} from '@angular/router';
import {inject} from '@angular/core';

export const loginGuardGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  if(localStorage.getItem('token')){
    return true;
  }
  return router.parseUrl('/daznfantasy/login');
};
