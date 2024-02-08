import { createServiceFactory, SpectatorService } from '@ngneat/spectator/jest';

import { firstValueFrom } from 'rxjs';

import { AuthDebugService } from './auth-debug.service';
import { AUTH_NAV_FN, AUTH_OPTIONS } from '../auth.models';

describe('AuthDebugService', () => {
  let spectator: SpectatorService<AuthDebugService>;
  const createService = createServiceFactory({
    service: AuthDebugService,
    providers: [
      {
        provide: AUTH_OPTIONS,
        useValue: {}
      },
      {
        provide: AUTH_NAV_FN,
        useValue: () => {
          /** empty */
        }
      }
    ]
  });

  beforeEach(() => (spectator = createService()));

  it('initial debug values', async () => {
    expect(spectator.service.isLoggedIn).toBe(false);
    expect(spectator.service.name).toBe('Test Name');
    expect(await firstValueFrom(spectator.service.permissions$)).toBe(null);
    expect(await firstValueFrom(spectator.service.permissionsLoaded$)).toBe(false);
  });
});
