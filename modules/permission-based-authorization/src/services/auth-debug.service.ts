import { inject, Injectable } from '@angular/core';

import { BehaviorSubject, Observable, take, timer } from 'rxjs';

import { AuthFlowService, AuthPermissionsService } from './auth.service';
import { AUTH_NAV_FN, AUTH_OPTIONS } from '../auth.models';

@Injectable()
export class AuthDebugService implements AuthFlowService, AuthPermissionsService {
  #loggedIn = window.sessionStorage.getItem('NG_DEBUG_LOGIN') === 'true';
  #options = inject(AUTH_OPTIONS);
  #navigateFn = inject(AUTH_NAV_FN);
  #permissionsLoaded$ = new BehaviorSubject(false);
  #permissions$ = new BehaviorSubject<number | null>(null);

  get isLoggedIn(): boolean {
    return this.#loggedIn;
  }

  get name(): string {
    return 'Test Name';
  }

  get permissions$(): Observable<number | null> {
    return this.#permissions$;
  }

  get permissionsLoaded$(): Observable<boolean> {
    return this.#permissionsLoaded$;
  }

  startPermissionsLoading(): void {
    timer(500)
      .pipe(take(1))
      .subscribe(() => {
        this.#permissions$.next(255);
        this.#permissionsLoaded$.next(true);
      });
  }

  getBearerToken(): string {
    return '';
  }

  startAuthentication(): void {
    void this.#navigateFn(this.#options.signInCallbackUrl);
  }

  completeAuthentication(): Promise<boolean> {
    this.#loggedIn = true;
    window.sessionStorage.setItem('NG_DEBUG_LOGIN', 'true');
    return Promise.resolve(true);
  }

  signOut(): void {
    this.#loggedIn = false;
    window.sessionStorage.removeItem('NG_DEBUG_LOGIN');
  }
}
