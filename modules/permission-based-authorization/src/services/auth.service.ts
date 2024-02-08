import { Observable } from 'rxjs';

export abstract class AuthFlowService {
  abstract get isLoggedIn(): boolean;
  abstract get name(): string;
  abstract getBearerToken(): string;
  abstract startAuthentication(): void;
  abstract completeAuthentication(): Promise<boolean>;
  abstract signOut(): void;
}

export abstract class AuthPermissionsService {
  abstract get permissions$(): Observable<number | null>;
  abstract get permissionsLoaded$(): Observable<boolean>;
  abstract startPermissionsLoading(): void;
}
