import { checkPermission } from './auth.functions';

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
