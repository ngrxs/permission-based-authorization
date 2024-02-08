import { inject, Injectable } from '@angular/core';

import { AuthFlowService } from './auth.service';
import { AUTH_NAV_FN, AUTH_OPTIONS } from '../auth.models';

@Injectable()
export class AuthCallbackService {
  #auth = inject(AuthFlowService);
  #options = inject(AUTH_OPTIONS);
  #navigateFn = inject(AUTH_NAV_FN);

  completeAuthentication(): void {
    this.#auth
      .completeAuthentication()
      .then((success) => {
        if (success) {
          this.#navigateFn(this.#options.homeUrl);
        }
      })
      .catch((ex: Error) => console.error(ex.message));
  }
}
