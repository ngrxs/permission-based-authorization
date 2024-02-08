# @ngrxs/permission-based-authorization

`@ngrxs/permission-based-authorization` library that provide a common authentication based on permissions and not roles.

## Installation

1.  Install the library:
    ```shell
    npm install --save @ngrxs/permission-based-authorization
    ```

1.  Use `providePermissionBasedAuthorization`, `AuthFlowService` and `AuthPermissionsService` in `app.config.ts`:

    ```typescript

    import { ApplicationConfig } from '@angular/core';
    import { providePermissionBasedAuthorization, AuthFlowService, AuthPermissionsService, AuthDebugService } from '@ngrxs/permission-based-authorization';

    enum PagePermissions {
      None = 0,
      ViewDashboard = 1,
      ViewUsers = 2,
    }

    export const appConfig: ApplicationConfig = {
      providers: [
        { provide: AuthFlowService, useClass: AuthDebugService },
        { provide: AuthPermissionsService, useClass: AuthDebugService },
        providePermissionBasedAuthorization({
          routePermissions: {
            '/': null,
            '/dashboard': PagePermission.ViewDashboard,
            '/users': PagePermission.ViewUsers,
          },
          signInUrl: '/',
        })
      ]
    };

    ```

1. Use in `app.routes.ts`

   ```typescript

   import { AuthFlowService, AuthRouteCheckService } from '@ngrxs/permission-based-authorization';
   
   const authLoginRedirect: CanActivateFn = (route: ActivatedRouteSnapshot): UrlTree | boolean => {
     const isLoggedIn = inject(AuthFlowService).isLoggedIn;
     return isLoggedIn ? createUrlTreeFromSnapshot(route, ['home']) : true;
   };

   const canActivateRoute: CanActivateFn = (_, state: RouterStateSnapshot) =>
     inject(AuthRouteCheckService).checkRoutePermission(state.url);

   const canActivateChildRoute: CanActivateChildFn = (_, state: RouterStateSnapshot) =>
     inject(AuthRouteCheckService).checkRoutePermission(state.url);

   export const routes: Routes = [
      /** routes */
   ];

   ```  

## Usage

Provides auth based on permissions.

## Real world auth service

```typescript
import { AuthFlowService, AuthPermissionsService } from '@ngrxs/permission-based-authorization';

import { OAuthService } from 'angular-oauth2-oidc';
import { JwksValidationHandler } from 'angular-oauth2-oidc-jwks';

@Injectable()
export class AuthGoogleService implements AuthFlowService {
  #user: { given_name: string } | null = null;
  #oauth: OAuthService;

  constructor(settings: AppSettings, oauthService: OAuthService) {
    const oauthConfigs = getAuthConfig(settings);
    oauthService.configure({
      issuer: 'https://accounts.google.com',
      redirectUri: settings.webBasePath + 'oauth-callback',
      clientId: settings.googleClientId,
      scope: 'openid profile email',
      sessionChecksEnabled: true,
      strictDiscoveryDocumentValidation: false,
    });
    oauthService.tokenValidationHandler = new JwksValidationHandler();

    this.#oauth = oauthService;
  }

  get isLoggedIn(): boolean {
    return this.#oauth.hasValidAccessToken();
  }

  get name(): string {
    return this.#user === null ? '' : this.#user.given_name;
  }

  getBearerToken(): string {
    return this.#oauth.getIdToken();
  }

  signOut(): void {
    this.#oauth.logOut();
  }

  startAuthentication(): void {
    void this.#oauth.loadDiscoveryDocumentAndLogin();
  }

  async completeAuthentication(): Promise<boolean> {
    const successLogin = await this.#oauth.loadDiscoveryDocumentAndTryLogin({ });
    if (!successLogin) return false;

    this.#user = await this.#oauth
      .loadUserProfile()
      .then(it => it as GoogleUserInfo)
      .catch(error => {
        console.error(error);
        return null;
      });

    return true;
  }
}

@Injectable()
export class AuthApiPermissionsService implements AuthPermissionsService {
  #permissionsLoaded$ = new BehaviorSubject(false);
  #permissions$ = new BehaviorSubject<number | null>(null);
  #http = inject(HttpClient);

  get permissions$(): Observable<number | null> {
    return this.#permissions$;
  }

  get permissionsLoaded$(): Observable<boolean> {
    return this.#permissionsLoaded$;
  }

  startPermissionsLoading(): void {
    this.#http.get<{ permissions: number }>('api/v1/profile').subscribe({
      next: ({ permissions }) => this.#permissions$.next(permissions),
      error: () => this.#permissions$.next(0),
      finally: () => this.#permissionsLoaded$.next(true),
    })
  }
}
```

### OpenId Connect Callback

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AuthCallbackService } from '@ngrxs/permission-based-authorization';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  template: '<p>Please wait while we redirect you back</p>',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthCallbackComponent {
  constructor(auth: AuthCallbackService) {
    auth.completeAuthentication();
  }
}
```

## Interfaces

```typescript
interface AuthFeatureOptions {
  routePermissions: { [route: string]: number } // all route access permissions
  homeUrl: string; // home page url
  signInUrl: string; // login page
  signInCallbackUrl: string; // openid-connect callback url
  noAccessUrl: string; // no access url
}
```
