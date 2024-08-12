import { Permission, PageRoutePermission } from './auth.models';

function compileRoutePermission(routes: Record<string, number | null>): PageRoutePermission[] {
  const arr: PageRoutePermission[] = [];
  for (const route in routes) {
    if (Object.prototype.hasOwnProperty.call(routes, route)) {
      if (route[0] !== '/') {
        throw new Error('An absolute only paths are allowed!');
      }

      const idx = route.indexOf('**');
      const lastIdxWhenStars = route.length - 2;
      const regex =
        idx <= -1
          ? null
          : idx === lastIdxWhenStars
            ? new RegExp('^' + route.substring(0, lastIdxWhenStars))
            : new RegExp('^' + route.replace('**', '[\\w-]+') + '$');

      arr.push({ route, permission: routes[route], regex });
    }
  }

  return arr;
}

export function createGetPermission(
  routes: Record<string, number | null>
): (path: string) => number | null {
  const pageRoutePermissions = compileRoutePermission(routes);
  const count = pageRoutePermissions.length;
  return (path: string): number | null => {
    for (let index = 0; index < count; index++) {
      const per = pageRoutePermissions[index];
      const valid = per.regex !== null ? per.regex.test(path) : per.route === path;
      if (valid) {
        return per.permission;
      }
    }

    return null;
  };
}

export function checkPermission<T extends Permission>(
  permission: T[keyof T] | null,
  userAccess: T[keyof T]
): boolean {
  return (
    typeof permission !== 'undefined' &&
    (permission === null || ((userAccess as number) & (permission as number)) === permission)
  );
}
