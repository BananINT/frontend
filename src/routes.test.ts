import { describe, expect, it } from 'vitest';
import app from './App.tsx?raw';
import nginx from '../nginx.conf?raw';

describe('nginx app routes', () => {
    it('serves every static route of App.tsx, so none of them turns into a 404', () => {
        const allowlist = nginx.match(/location ~ (\^\/\(timeline.*\$) \{/)?.[1];
        expect(allowlist).toBeDefined();
        const served = new RegExp(allowlist!);

        const routes = [...app.matchAll(/path="(\/[^"]*)"/g)].map(match => match[1]);
        expect(routes.length).toBeGreaterThan(20);

        // The homepage and the blog have their own nginx locations.
        const appRoutes = routes.filter(route => route !== '/' && !route.startsWith('/blog'));
        expect(appRoutes.filter(route => !served.test(route))).toEqual([]);
        expect(served.test('/n-existe-pas')).toBe(false);
    });
});
