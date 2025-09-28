import { getEnvValue } from '../utils/envUtils';

export default defineNitroPlugin((nitroApp) => {
	// Generic request hook: runs before any API request on the server
	nitroApp.hooks.hook('api-party:request', async (ctx: any) => {
		// Diagnostics: show endpoint and target once per request
		const method = ctx?.options?.method || 'GET';
		const url = ctx?.url || ctx?.options?.url || '';
		const baseURL = ctx?.options?.baseURL || ctx?.options?.baseUrl || '';
		console.log('--- Request hook ---', method, baseURL + url);

		// 1) Guard against recursive baseURL pointing to our own api-party endpoint
		// If baseURL is relative (starts with /) or points to our server /api/_party, force it to external IGDB API
		const configuredBase = process.env.IGDB_API_BASE_URL || '';
		const isAbsolute = /^https?:\/\//i.test(baseURL || configuredBase);
		const looksInternalApiParty = (s: string) => /\/api\/_party\//i.test(s);

		if (!isAbsolute || looksInternalApiParty(baseURL)) {
			if (!/^https?:\/\//i.test(configuredBase)) {
				console.error(
					'api-party: IGDB_API_BASE_URL is misconfigured. Expected absolute http(s) URL, got:',
					configuredBase
				);
			} else {
				// Rewrite baseURL to external IGDB API to avoid self-recursion
				ctx.options.baseURL = configuredBase;
				console.warn('api-party: Rewrote baseURL to', configuredBase);
			}
		}

		// 2) Attach bearer token safely (headers may be a plain object)
		const token = getEnvValue('IGDB_TOKEN');
		// ctx.options.headers = {
		// 	...(ctx.options.headers || {}),
		// 	Authorization: `Bearer ${token}`,
		// };
		ctx.options.headers.set('Authorization', `Bearer ${token}`);
	});
});
