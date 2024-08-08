import { createServiceFactory, SpectatorService } from '@ngneat/spectator/jest';

import { AuthRouteCheckService } from './auth-route-check.service';
import { AuthFlowService, AuthPermissionsService } from './auth.service';
import { AUTH_GET_ROUTE_PERMISSION_FN, AUTH_NAV_FN, AUTH_OPTIONS } from '../auth.models';
import { of } from 'rxjs';
import { when } from 'jest-when';

const createMockObjectWithProps = (props: Record<string, () => unknown>) =>
  Object.defineProperties(
    {},
    Object.entries(props).reduce((acc, [key, value]) => {
      acc[key] = { get: value };
      return acc;
    }, {} as Record<string, PropertyDescriptor>)
  );

describe('AuthRouteCheckService', () => {
  const navFn = jest.fn();
  const permissionsFn = jest.fn<number | null, []>();
  const permissionsLoadedFn = jest.fn<boolean, []>();
  const routePermissionsFn = jest.fn<number, [string]>();
  const isSignedInFn = jest.fn<boolean, []>();
  const startPermissionsLoadingFn = jest.fn<void, []>();
  const authPermissionsServiceMock = createMockObjectWithProps({
    permissions$: () => of(permissionsFn()),
    permissionsLoaded$: () => of(permissionsLoadedFn()),
    startPermissionsLoading: () => startPermissionsLoadingFn
  });

  const authFlowServiceMock = createMockObjectWithProps({
    isLoggedIn: () => isSignedInFn()
  });

  const createService = createServiceFactory({
    service: AuthRouteCheckService,
    providers: [
      {
        provide: AUTH_OPTIONS,
        useValue: { signInUrl: '/test-sign-in', noAccessUrl: '/test-no-access' }
      },
      { provide: AUTH_NAV_FN, useValue: navFn },
      {
        provide: AUTH_GET_ROUTE_PERMISSION_FN,
        useValue: (route: string) => routePermissionsFn(route)
      },
      { provide: AuthPermissionsService, useValue: authPermissionsServiceMock },
      { provide: AuthFlowService, useValue: authFlowServiceMock }
    ]
  });

  let spectator: SpectatorService<AuthRouteCheckService>;

  beforeEach(() => {
    spectator = createService();
  });

  it('should navigate to signInUrl when not authenticated', async () => {
    isSignedInFn.mockReturnValueOnce(false);
    await spectator.service.checkRoutePermission('/test-url').toPromise();

    expect(navFn).toHaveBeenCalledWith('/test-sign-in');
  });

  it('should navigate to noAccessUrl when not authorized', async () => {
    isSignedInFn.mockReturnValueOnce(true);
    permissionsFn.mockReturnValueOnce(0);
    permissionsLoadedFn.mockReturnValueOnce(true);

    await spectator.service.checkRoutePermission('/test-url').toPromise();

    expect(navFn).toHaveBeenCalledWith('/test-no-access');
  });

  it('should startPermissionsLoading when permissions not loaded', async () => {
    isSignedInFn.mockReturnValueOnce(true);
    permissionsLoadedFn.mockReturnValueOnce(false);
    permissionsFn.mockReturnValueOnce(null);

    await spectator.service.checkRoutePermission('/test-url').toPromise();

    expect(startPermissionsLoadingFn).toHaveBeenCalled();
  });

  it('should validate route permissions', async () => {
    isSignedInFn.mockReturnValueOnce(true);
    permissionsLoadedFn.mockReturnValueOnce(true);
    permissionsFn.mockReturnValueOnce(8);
    when(routePermissionsFn).calledWith('/test-url').mockReturnValueOnce(8);

    const valid = await spectator.service.checkRoutePermission('/test-url').toPromise();

    expect(valid).toBe(true);
    expect(navFn).not.toHaveBeenCalled();
  });
});
