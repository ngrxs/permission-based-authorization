import { TestBed } from '@angular/core/testing';

import { providePermissionBasedAuthorization } from './auth.providers';
import { AuthCallbackService } from './services/auth-callback.service';
import { AuthCheckService } from './services/auth-check.service';
import { AUTH_GET_ROUTE_PERMISSION_FN, AUTH_NAV_FN, AUTH_OPTIONS } from './auth.models';
import { AuthFlowService, AuthPermissionsService } from './services/auth.service';

describe('providePermissionBasedAuthorization', () => {
  it('should return providers', () => {
    TestBed.configureTestingModule({
      providers: [
        providePermissionBasedAuthorization(),
        { provide: AuthFlowService, useValue: {} },
        { provide: AuthPermissionsService, useValue: {} }
      ]
    });

    expect(TestBed.inject(AuthCallbackService)).toBeDefined();
    expect(TestBed.inject(AuthCheckService)).toBeDefined();
    expect(TestBed.inject(AUTH_GET_ROUTE_PERMISSION_FN)).toBeDefined();
    expect(TestBed.inject(AUTH_NAV_FN)).toBeDefined();

    const options = TestBed.inject(AUTH_OPTIONS);
    expect(options).toBeDefined();
    expect(options.homeUrl).toBe('/');
    expect(options.signInUrl).toBe('/login');
    expect(options.signInCallbackUrl).toBe('/oauth-callback');
    expect(options.noAccessUrl).toBe('/no-access');
  });
});
