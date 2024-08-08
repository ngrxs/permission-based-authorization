import {
  APP_INITIALIZER,
  ENVIRONMENT_INITIALIZER,
  Injectable,
  makeEnvironmentProviders
} from '@angular/core';

import { activeLoaders, FromJsonOptions, getJsonSettings, setupJsonSettings, Type } from './core';
import { JsonSettingsLoader } from './json-settings-loader';

export { setupJsonSettings };

export function FromJson<T>(options: FromJsonOptions<T>) {
  return function (target: Type<T>): Type<T> {
    @Injectable()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    class JsonSettings extends (target as any) {
      constructor(...args: unknown[]) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        super(...args);
        if (!activeLoaders.get(JsonSettings)?.loaded) {
          throw new Error('Configuration was not initialized');
        }
      }
    }

    activeLoaders.set(JsonSettings, {
      ...options,
      loaded: false,
      task: Promise.reject()
    });

    return JsonSettings as Type<T>;
  };
}

export function provideJsonSettings(...classes: Type[]) {
  return makeEnvironmentProviders([
    { provide: JsonSettingsLoader, useValue: new JsonSettingsLoader() },
    {
      provide: ENVIRONMENT_INITIALIZER,
      useFactory: (loader: JsonSettingsLoader) => () => loader.startLoading(),
      deps: [JsonSettingsLoader],
      multi: true
    },
    {
      provide: APP_INITIALIZER,
      useFactory: (loader: JsonSettingsLoader) => () =>
        getJsonSettings().applicationStartWaitJsonSettings
          ? loader.waitUntilAllLoaded()
          : Promise.resolve(),
      deps: [JsonSettingsLoader],
      multi: true
    },
    ...classes
  ]);
}
