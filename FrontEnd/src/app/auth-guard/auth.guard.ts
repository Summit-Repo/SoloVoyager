import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    if (state.url === '/admin') {
      return sessionStorage.getItem('isAdmin') === 'true' && sessionStorage.getItem('token') !== null ? true : this.defaultRedirect();
    }

    if (state.url === '/user') {
      return sessionStorage.getItem('isAdmin') === 'false' && sessionStorage.getItem('token') !== null ? true : this.defaultRedirect();
    }

    return this.defaultRedirect();
  }

  private defaultRedirect(): UrlTree {
    return this.router.parseUrl('/login');
  }
}
