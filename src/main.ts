import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

if (!window.storage) {
  window.storage = {
    async get(key: string): Promise<{ value: string } | null> {
      const item = localStorage.getItem(key);
      return item ? { value: item } : null;
    },
    async set(key: string, value: string): Promise<void> {
      localStorage.setItem(key, value);
    }
  };
}

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));