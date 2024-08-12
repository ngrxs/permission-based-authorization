import {
  createServiceFactory,
  mockProvider,
  SpectatorService,
  SpyObject
} from '@ngneat/spectator/jest';

import { AuthCallbackService } from './auth-callback.service';
import { AuthFlowService } from './auth.service';
import { AUTH_NAV_FN, AUTH_OPTIONS } from '../auth.models';

describe('AuthCallbackService', () => {
  const navFn = jest.fn();
  const createService = createServiceFactory({
    service: AuthCallbackService,
    providers: [
      { provide: AUTH_OPTIONS, useValue: { homeUrl: '/test-home' } },
      { provide: AUTH_NAV_FN, useValue: navFn },
      mockProvider(AuthFlowService, { completeAuthentication: jest.fn() })
    ]
  });

  let spectator: SpectatorService<AuthCallbackService>;
  let authFlowService: SpyObject<AuthFlowService>;
  beforeEach(() => {
    spectator = createService();
    authFlowService = spectator.inject(AuthFlowService);
  });

  it('should navigate to homeUrl on successful authentication', async () => {
    authFlowService.completeAuthentication.mockResolvedValue(true);
    await spectator.service.completeAuthenticationAsync();
    expect(navFn).toHaveBeenCalledWith('/test-home');
  });
});
