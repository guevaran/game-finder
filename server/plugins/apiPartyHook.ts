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
			const configuredBase = process.env.IGDB_API_BASE_URL || getEnvValue('IGDB_API_BASE_URL');
			if (configuredBase && /^https?:\/\//i.test(configuredBase)) {
				ctx.options.baseURL = configuredBase;
			} else {
				console.error('api-party: Missing or invalid IGDB_API_BASE_URL.');
			}
		}

		// Attach headers safely (supports Headers or plain object)
		const ensureHeader = (key: string, value?: string) => {
			if (!value) return;
			const current = ctx.options.headers;
			if (current && typeof (current as any).set === 'function') {
				// Headers-like
				(current as any).set(key, value);
			} else {
				ctx.options.headers = { ...(current || {}), [key]: value };
			}
		};

		const token = await getTokenValue('IGDB_TOKEN');
		const clientId = process.env.IGDB_CLIENT_ID || getEnvValue('IGDB_CLIENT_ID') || undefined;
		ensureHeader('Authorization', token ? `Bearer ${token}` : undefined);
		ensureHeader('Client-ID', clientId);

		// Prevent ofetch retry storms if IGDB is unreachable
		if (ctx.options.retry === undefined) {
			ctx.options.retry = 0;
		}
	});
});
