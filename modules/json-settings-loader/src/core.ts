interface JsonSettingsModuleOptions {
  debug?: true | ((message: string) => void);
  applicationStartWaitJsonSettings?: boolean;
  loader?: (url: string) => Promise<Record<string, unknown>>;
}

export interface FromJsonOptions<T> {
  url: string | (() => string);
  transform?: (env: Readonly<T>) => T;
}

interface JsonSettingsLoaderOptions extends FromJsonOptions<unknown> {
  loaded: boolean;
  task: Promise<unknown>;
}

interface InnerLogger {
  debug: (message: string) => void;
}

const jsonSettingsModuleOptions: JsonSettingsModuleOptions & InnerLogger = {
  debug: () => {
    /* noop */
  },
  applicationStartWaitJsonSettings: true,
  loader: (url: string) =>
    new Promise<Record<string, unknown>>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url);
      xhr.onload = () =>
        resolve(
          JSON.parse(xhr.responseText) // eslint-disable-line  @typescript-eslint/no-unsafe-argument
        );
      xhr.onerror = () => reject(new Error(xhr.statusText));
      xhr.send();
    })
};

export interface Type<T = unknown> {
  prototype: T;
  new (...args: unknown[]): T;
}

export const activeLoaders = new Map<unknown, JsonSettingsLoaderOptions>();

export function setupJsonSettings(options: JsonSettingsModuleOptions) {
  if (typeof options !== 'object') throw new Error('Invalid options provided');
  if (options.debug === true) options.debug = console.log;
  Object.assign(jsonSettingsModuleOptions, options);
}

export function getJsonSettings() {
  return Object.freeze(jsonSettingsModuleOptions);
}
