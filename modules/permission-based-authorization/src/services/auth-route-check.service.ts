import { inject, Injectable } from '@angular/core';

import { combineLatest, Observable, of } from 'rxjs';
import { filter, map, take, tap } from 'rxjs/operators';

import { AuthFlowService, AuthPermissionsService } from './auth.service';
import { AUTH_GET_ROUTE_PERMISSION_FN, AUTH_NAV_FN, AUTH_OPTIONS } from '../auth.models';
import { checkPermission } from '../auth.functions';

@Injectable()
export class AuthRouteCheckService {
  #authFlow = inject(AuthFlowService);
  #auth = inject(AuthPermissionsService);
  #getRoutePermissionFn = inject(AUTH_GET_ROUTE_PERMISSION_FN);
  #options = inject(AUTH_OPTIONS);
  #navigateFn = inject(AUTH_NAV_FN);

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
      map((permissions) => checkPermission(this.#getRoutePermissionFn(url), permissions)),
      tap((valid) => {
        if (!valid) {
          this.#navigateFn(this.#options.noAccessUrl);
        }
      })
    );
  }
}
