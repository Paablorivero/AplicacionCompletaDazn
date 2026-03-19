import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthServiceService } from '../Services/auth-service.service';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(AuthServiceService);

  if (!authService.getToken()) {
    return router.parseUrl('/daznfantasy/login');
  }

  if (!authService.isAdmin()) {
    return router.parseUrl('/daznfantasy/home');
  }

  return true;
};
