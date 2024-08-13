import { inject, Injectable } from '@angular/core';

import { combineLatest, Observable, of } from 'rxjs';
import { filter, map, take, tap } from 'rxjs/operators';

import { AuthFlowService, AuthPermissionsService } from './auth.service';
import { AUTH_GET_ROUTE_PERMISSION_FN, AUTH_NAV_FN, AUTH_OPTIONS } from '../auth.models';
import { checkPermission } from '../auth.functions';

@Injectable()
export class AuthCheckService {
  readonly #authFlow = inject(AuthFlowService);
  readonly #auth = inject(AuthPermissionsService);
  readonly #getRoutePermissionFn = inject(AUTH_GET_ROUTE_PERMISSION_FN);
  readonly #options = inject(AUTH_OPTIONS);
  readonly #navigateFn = inject(AUTH_NAV_FN);
  readonly #checkRoutePermissionFn = (permissions: number, route: string) =>
    checkPermission(this.#getRoutePermissionFn(route), permissions);

  checkPermission(permission: number): Observable<boolean> {
    return this.#auth.permissions$.pipe(
      take(1),
      map((access) => checkPermission(permission, access))
    );
  }

  checkRoutePermission(url: string): Observable<boolean> {
    const auth = this.#authFlow.isLoggedIn;
    if (!auth) {
      this.#navigateFn(this.#options.signInUrl);
      return of(false);
    }

    return combineLatest([this.#auth.permissions$, this.#auth.permissionsLoaded$]).pipe(
      map(([permissions, loaded]) => {
        if (!loaded) {
          this.#auth.startPermissionsLoading();
        }

        return permissions;
      }),
      filter((permissions): permissions is number => permissions !== null),
      take(1),
      map((permissions) => this.#checkRoutePermissionFn(permissions, url)),
      tap((valid) => {
        if (!valid) {
          this.#navigateFn(this.#options.noAccessUrl);
        }
      })
    );
  }

  /** Check route permissions after the identity information is loaded. */
  deferredCheckRoutePermission<TResult>(
    act: (checkRoute: (route: string) => boolean) => TResult
  ): Observable<TResult> {
    return this.#auth.permissions$.pipe(
      filter((permissions): permissions is number => permissions !== null),
      take(1),
      map((access) => {
        const checkRoutePermission = this.#checkRoutePermissionFn.bind(this, access);
        return act(checkRoutePermission);
      })
    );
  }
}
