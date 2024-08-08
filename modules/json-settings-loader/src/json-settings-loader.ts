import { Injectable } from '@angular/core';

import { activeLoaders, getJsonSettings } from './core';

@Injectable()
export class JsonSettingsLoader {
  startLoading(): void {
    const { debug, loader } = getJsonSettings();
    activeLoaders.forEach((options, type) => {
      if (options.loaded) return;

      const url = typeof options.url === 'function' ? options.url() : options.url;
      debug('Loading configurations from ' + url);
      options.task = loader(url)
        .then(options.transform ?? ((x) => x))
        .then((x) => {
          if (typeof type === 'function') {
            Object.assign(type.prototype, x);
          }
        })
        .finally(() => {
          options.loaded = true;
          debug('Configurations loaded from ' + url);
        })
        .catch((ex) => {
          throw new Error('Error when retrieving configs' + JSON.stringify(ex));
        });
    });
  }

  waitUntilAllLoaded(): Promise<unknown> {
    const tasks: Promise<unknown>[] = [];
    activeLoaders.forEach((x) => tasks.push(x.task));
    return Promise.all(tasks);
  }
}
