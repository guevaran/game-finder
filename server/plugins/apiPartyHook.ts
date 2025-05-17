import { getEnvValue } from '../utils/envUtils';

export default defineNitroPlugin((nitroApp) => {
	// Generic request hook: runs before any API request on the server
	nitroApp.hooks.hook('api-party:request', async (ctx, event) => {
		// console.log('--- Request hook ---');
		// Fetch the last token and attach it to the request
		const token = getEnvValue('IGDB_TOKEN');
		// console.log('token:', token);
		ctx.options.headers.set('Authorization', `Bearer ${token}`);
	});
});
