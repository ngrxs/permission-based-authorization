import { checkPermission, createGetPermission } from './auth.functions';

describe('checkPermission', () => {
  it('should return true when permission is null', () => {
    expect(checkPermission(null, 1)).toBe(true);
  });

  it('should return false when permission is undefined', () => {
    expect(checkPermission(undefined as unknown as string, 1)).toBe(false);
  });

  it('should return false when permission is not set', () => {
    expect(checkPermission(2, 1)).toBe(false);
  });

  it('should return true when permission is set', () => {
    expect(checkPermission(1, 1)).toBe(true);
  });
});

describe('createGetPermission', () => {
  it('should return null when no permission is set', () => {
    const getPermission = createGetPermission({});
    expect(getPermission('/')).toBe(null);
  });

  it('should return permission when set', () => {
    const getPermission = createGetPermission({ '/': 1 });
    expect(getPermission('/')).toBe(1);
  });

  it('should handle regex', () => {
    const getPermission = createGetPermission({ '/': 1, '/test2/**/edit': 2, '/test/**': 3 });
    expect(getPermission('/')).toBe(1);
    expect(getPermission('/test2/1/edit')).toBe(2);
    expect(getPermission('/test/')).toBe(3);
  });
});
