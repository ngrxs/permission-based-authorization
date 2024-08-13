import { createServiceFactory, SpectatorService } from '@ngneat/spectator/jest';

import { firstValueFrom, from } from 'rxjs';

import { AuthCheckService } from './auth-check.service';
import { AuthFlowService, AuthPermissionsService } from './auth.service';
import { AUTH_GET_ROUTE_PERMISSION_FN, AUTH_NAV_FN, AUTH_OPTIONS } from '../auth.models';

import { when } from 'jest-when';
import { fakeAsync, tick } from '@angular/core/testing';

const createMockObjectWithProps = (props: Record<string, () => unknown>) =>
  Object.defineProperties(
    {},
    Object.entries(props).reduce(
      (acc, [key, value]) => {
        acc[key] = { get: value };
        return acc;
      },
      {} as Record<string, PropertyDescriptor>
    )
  );

describe('AuthRouteCheckService', () => {
  const navFn = jest.fn();
  const permissionsFn = jest.fn<Promise<number | null>, []>();
  const permissionsLoadedFn = jest.fn<Promise<boolean>, []>();
  const routePermissionsFn = jest.fn<number, [string]>();
  const isSignedInFn = jest.fn<boolean, []>();
  const startPermissionsLoadingFn = jest.fn<void, []>();
  const authPermissionsServiceMock = createMockObjectWithProps({
    permissions$: () => from(permissionsFn()),
    permissionsLoaded$: () => from(permissionsLoadedFn()),
    startPermissionsLoading: () => startPermissionsLoadingFn
  });

  const authFlowServiceMock = createMockObjectWithProps({
    isLoggedIn: () => isSignedInFn()
  });

  const createService = createServiceFactory({
    service: AuthCheckService,
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

  let spectator: SpectatorService<AuthCheckService>;

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
    permissionsFn.mockResolvedValueOnce(0);
    permissionsLoadedFn.mockResolvedValueOnce(true);

    await spectator.service.checkRoutePermission('/test-url').toPromise();

    expect(navFn).toHaveBeenCalledWith('/test-no-access');
  });

  it('should startPermissionsLoading when permissions not loaded', async () => {
    isSignedInFn.mockReturnValueOnce(true);
    permissionsLoadedFn.mockResolvedValueOnce(false);
    permissionsFn.mockResolvedValueOnce(null);

    await spectator.service.checkRoutePermission('/test-url').toPromise();

    expect(startPermissionsLoadingFn).toHaveBeenCalled();
  });

  it('should validate route permissions', async () => {
    isSignedInFn.mockReturnValueOnce(true);
    permissionsLoadedFn.mockResolvedValueOnce(true);
    permissionsFn.mockResolvedValueOnce(8);
    when(routePermissionsFn).calledWith('/test-url').mockReturnValueOnce(8);

    const valid = await spectator.service.checkRoutePermission('/test-url').toPromise();

    expect(valid).toBe(true);
    expect(navFn).not.toHaveBeenCalled();
  });

  it('should not checkPermission when available', () => {
    permissionsFn.mockReturnValueOnce(new Promise(() => {}));

    let completed = false;
    firstValueFrom(spectator.service.checkPermission(4))
      .finally(() => (completed = true))
      .catch(() => {});

    expect(completed).toBe(false);
  });

  it('checkPermission must return false when permission is null', async () => {
    permissionsFn.mockResolvedValueOnce(null);

    const valid = await firstValueFrom(spectator.service.checkPermission(4));

    expect(valid).toBe(false);
  });

  it('should checkPermission when available', async () => {
    permissionsFn.mockResolvedValueOnce(7);

    const valid = await firstValueFrom(spectator.service.checkPermission(4));

    expect(valid).toBe(true);
  });

  it('deferred checkPermission should return when permission available', fakeAsync(() => {
    when(routePermissionsFn).calledWith('/deferred-test-url').mockReturnValueOnce(256);
    let permissionsResolve: (value: number) => void = () => {};
    permissionsFn.mockReturnValueOnce(
      new Promise((resolve) => {
        permissionsResolve = resolve;
      })
    );

    let completed = false;
    let result: boolean | null = null;
    const obs = spectator.service.deferredCheckRoutePermission((check) =>
      check('/deferred-test-url')
    );

    firstValueFrom(obs)
      .then<boolean, void>((data) => (result = data))
      .finally(() => (completed = true))
      .catch(() => {});

    tick(100);
    expect(completed).toBe(false);
    expect(result).toBe(null);

    permissionsResolve(256);

    tick(100);
    expect(completed).toBe(true);
    expect(result).toBe(true);
  }));
});
