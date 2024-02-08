import { InjectionToken } from '@angular/core';

export type EnumLikeType<T> = { [id: string]: T | string };
export type Permission = EnumLikeType<number>;
export type RoutePermissions<T extends EnumLikeType<unknown>> = Record<string, T[keyof T] | null>;
export interface PageRoutePermission {
  route: string;
  permission: number | null;
  regex: RegExp | null;
}

export interface AuthFeatureOptions<T extends Permission> {
  routePermissions: RoutePermissions<T>;
  homeUrl: string;
  signInUrl: string;
  signInCallbackUrl: string;
  noAccessUrl: string;
}

export type GetRoutePermissionFn = (path: string) => number | null;

export const AUTH_OPTIONS = new InjectionToken<AuthFeatureOptions<Permission>>('__AUTH_OPTIONS');
export const AUTH_GET_ROUTE_PERMISSION_FN = new InjectionToken<GetRoutePermissionFn>('__AUTH_GRP');
export const AUTH_NAV_FN = new InjectionToken<(path: string) => void>('__AUTH_NAV_FN');
