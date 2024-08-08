# @ngrxs/json-settings-loader

`@ngrxs/json-settings-loader` library that provide a loading of configurations from JSON file.

## Installation

1.  Install the library:
    ```shell
    npm install --save @ngrxs/json-settings-loader
    ```

1.  Use `provideJsonSettings` and `FromJson` decorator

    ```typescript
    // file: app.settings.ts
    
    import { provideJsonSettings, FromJson } from '@ngrxs/json-settings-loader';

    @FromJson({
      url: 'app.settings.json',
      transform: (data) => ({ ...data, apiUrl: trimEndingSlashIfExists(data.apiUrl) })
    })
    export class AppSettings {
      apiUrl: string,
      tokenIssuer: string,
      environmentName: string
    }

    export const provideAppSettins = () =>
      provideJsonSettings(AppSettings);
    ```

    ```typescript
    // file: app.config.ts
    
    import { ApplicationConfig } from '@angular/core';
    import { provideAppSettins } from './app.settings';

    export const appConfig: ApplicationConfig = {
      providers: [
        provideAppSettins()
      ]
    };

    ```

    ```typescript
    // use anywere
    
    import { AppSettings } from './app.settings';

    @Injectable()
    export class MyService {
      #appSettings = inject(AppSettings);
    };

    ```

## Setup

Use the `setupJsonSettings` for setup.

```typescript
// file: app.config.ts
import setupJsonSettings from '@ngrxs/json-settings-loader';

setupJsonSettings({
  debug: (msg) => { console.log(msg) },
  applicationStartWaitJsonSettings: false,
  loader: (url) => fetch(url)
})
```

| property | value |
| -------- | ----- |
| debug    | Handle debug messages; <br> `true \| (msg: string) => void` (default to `empty function`) |
| applicationStartWaitJsonSettings | Application start waits for the json to be loaded <br> `boolean` (default to `true`) |
| loader | The HTTP loaded function <br> `(url: string) => Promise<unknown>` (default to using XMLHttpRequest) |
