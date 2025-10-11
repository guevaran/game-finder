import { getEnvValue } from '../utils/envUtils';
import { getTokenValue } from '../utils/tokenStore';

export default defineNitroPlugin((nitroApp) => {
	// Runs before any api-party request
	nitroApp.hooks.hook('api-party:request', async (ctx: any) => {
		const method = ctx?.options?.method || 'GET';
		const baseURL = ctx?.options?.baseURL || '';
		const request = ctx?.request || '';

		// Light diagnostic
		console.log('--- api-party:request ->', method, `${baseURL || ''}${request || ''}`);

		// If baseURL is missing/relative, force it from env to avoid local recursion
		if (!baseURL || baseURL.startsWith('/')) {
			console.log('process.env.IGDB_API_BASE_URL', process.env.IGDB_API_BASE_URL);
			console.log('getEnvValue(IGDB_API_BASE_URL)', getEnvValue('IGDB_API_BASE_URL'));

			const configuredBase = process.env.IGDB_API_BASE_URL || getEnvValue('IGDB_API_BASE_URL');
			if (configuredBase && /^https?:\/\//i.test(configuredBase)) {
				ctx.options.baseURL = configuredBase;
			} else {
				console.error('api-party: Missing or invalid IGDB_API_BASE_URL.');
			}
		}

		// Attach headers safely (plain object)
		const token = await getTokenValue('IGDB_TOKEN');

		ctx.options.headers.set('Authorization', `Bearer ${token}`);

		// NOT WORKING
		// ctx.options.headers = {
		// 	...(ctx.options.headers || {}),
		// 	...(token ? { Authorization: `Bearer ${token}` } : {}),
		// };

		// Prevent ofetch retry storms if IGDB is unreachable
		if (ctx.options.retry === undefined) {
			ctx.options.retry = 0;
		}
	});
});
