import { FromJson } from './index';
import { activeLoaders, setupJsonSettings, Type } from './src/core';
import { JsonSettingsLoader } from './src/json-settings-loader';

import { when } from 'jest-when';

@FromJson({ url: 'app.base.json' })
class AppBase {
  name: string;
}

@FromJson({ url: () => 'app.dynamic.json' })
class AppDynamicUrl {
  name: string;
}

@FromJson({
  url: 'app.settings.json',
  transform: (x) => ({ name: x.name + ' modified' })
})
class AppSettings {
  name: string;
}

const loader = jest.fn();
const getTask = (app: Type) => activeLoaders.get(app)?.task as Promise<void>;
setupJsonSettings({ loader, debug: true });

describe('JsonSettingsLoader', () => {
  it('should auto-register in active loaders', () => {
    const classLoader = activeLoaders.get(AppBase);
    expect(classLoader).toBeDefined();
    expect(classLoader.url).toBe('app.base.json');
    expect(classLoader.loaded).toBe(false);
  });

  it('should throw error when not initialized', () => {
    expect(() => new AppBase()).toThrowError('Configuration was not initialized');
  });

  describe('load', () => {
    afterEach(() => {
      activeLoaders.forEach((x) => {
        x.loaded = false;
        x.task = Promise.reject();
      });
    });

    it('should use string url', () => {
      loader.mockResolvedValue({});

      new JsonSettingsLoader().startLoading();

      expect(loader).toBeCalledWith('app.base.json');
    });

    it('should use url func', () => {
      loader.mockResolvedValue({});

      new JsonSettingsLoader().startLoading();

      expect(loader).toBeCalledWith('app.dynamic.json');
    });

    it('should load', async () => {
      when(loader)
        .calledWith('app.dynamic.json')
        .mockResolvedValueOnce({ name: 'Test Name' })
        .defaultResolvedValue({});

      new JsonSettingsLoader().startLoading();

      await getTask(AppDynamicUrl);

      const appSettings = new AppDynamicUrl();
      expect(appSettings.name).toBe('Test Name');
    });

    it('should load with transform', async () => {
      when(loader)
        .calledWith('app.settings.json')
        .mockResolvedValueOnce({ name: 'Test' })
        .defaultResolvedValue({});

      new JsonSettingsLoader().startLoading();

      await getTask(AppSettings);

      const appSettings = new AppSettings();
      expect(appSettings.name).toBe('Test modified');
    });
  });
});
