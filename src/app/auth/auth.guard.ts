import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { KeycloakService } from '../keycloak/keycloak.service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const tokenService = inject(KeycloakService);
  const router = inject(Router);
  if (!tokenService.keycloak.authenticated || tokenService.keycloak.isTokenExpired()) {
    tokenService.login();
    return false;
  }
  const roles = tokenService.keycloak?.tokenParsed?.["resource_access"]?.["front-client"]?.roles;
  const expectedRoles = route.data['roles'] as string[];



  if (!roles || !expectedRoles.some(role => roles.includes(role))) {
    router.navigate(['/forbidden']);
    setTimeout(() => {
      tokenService.logout();
    }, 1000);
    return false;
  }
  return true;
};