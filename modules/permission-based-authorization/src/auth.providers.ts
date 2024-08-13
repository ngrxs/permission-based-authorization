import { inject, makeEnvironmentProviders } from '@angular/core';
import { Router } from '@angular/router';

import { AuthCheckService } from './services/auth-check.service';
import {
  AUTH_GET_ROUTE_PERMISSION_FN,
  AUTH_NAV_FN,
  AUTH_OPTIONS,
  AuthFeatureOptions,
  Permission
} from './auth.models';
import { createGetPermission } from './auth.functions';
import { AuthCallbackService } from './services/auth-callback.service';

type ExtraProviderOptions = { navigateFnFactory?: () => (path: string) => void };

const defaultOptions: AuthFeatureOptions<Permission> = {
  routePermissions: {
    '/': null
  },
  homeUrl: '/',
  signInUrl: '/login',
  signInCallbackUrl: '/oauth-callback',
  noAccessUrl: '/no-access'
};

export const providePermissionBasedAuthorization = <T extends Permission>(
  options: Partial<AuthFeatureOptions<T>> = {},
  extraOptions: ExtraProviderOptions = {}
) => {
  const ops = { ...defaultOptions, ...options };
  return makeEnvironmentProviders([
    AuthCallbackService,
    AuthCheckService,
    {
      provide: AUTH_GET_ROUTE_PERMISSION_FN,
      useValue: createGetPermission(ops.routePermissions as Record<string, number | null>)
    },
    {
      provide: AUTH_NAV_FN,
      useFactory:
        extraOptions.navigateFnFactory ??
        (() => {
          const router = inject(Router);
          return (path: string): void => void router.navigateByUrl(path);
        })
    },
    { provide: AUTH_OPTIONS, useValue: ops }
  ]);
};
