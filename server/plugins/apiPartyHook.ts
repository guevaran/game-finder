import { getEnvValue } from '../utils/envUtils';
import { getTokenValue } from '../utils/tokenStore';

export default defineNitroPlugin((nitroApp) => {
	// Generic request hook: runs before any API request on the server
	nitroApp.hooks.hook('api-party:request', async (ctx: any, event: any) => {
		// Diagnostics: show endpoint and target once per request
		const method = ctx?.options?.method || 'GET';
		const baseURL = ctx?.options?.baseURL || '';
		const request = ctx?.request || '';

		console.log('--- api-party:request - EVENT:', JSON.stringify(event));
		console.log('--- api-party:request - CTX:', JSON.stringify(ctx));
		console.log('--- api-party:request -', method, baseURL + request);

		if (!baseURL && !request) {
			return;
		}

		const token = await getTokenValue('IGDB_TOKEN');
		ctx.options.headers.set('Authorization', `Bearer ${token}`);
	});
});
