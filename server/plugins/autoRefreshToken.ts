import { useScheduler } from '#scheduler';
import { getEnvValue } from '../utils/envUtils';
import { getTokenValue, setTokenValue } from '../utils/tokenStore';

export default defineNitroPlugin(() => {
	startScheduler();
});

function startScheduler() {
	const scheduler = useScheduler();

	console.log('--- Refresh token at start ---');
	refreshToken();

	// scheduler.run(async () => {
	//     console.log("--- I run every 30 seconds ---");
	//     refreshToken();
	// }).everySeconds(30);

	scheduler.run(async () => {
		console.log('--- Auto refresh token every weeks ---');

		refreshToken();

		// }).cron('0 0 0 */59 * *'); // ERROR  [worker reload] [worker init] */59 is a invalid expression for day of month
		// }).everyDays(59); // ERROR  [worker reload] [worker init] */59 is a invalid expression for day of month
		// }).cron('0 0 0 1 * *');
	}).weekly;
}

async function refreshToken() {
	var twitchAuthUrl = getEnvValue('IGDB_TWITCH_AUTH_URL');
	console.log('twitchAuthUrl: ', twitchAuthUrl);

	if (twitchAuthUrl) {
		const todayStr = new Date().toISOString().split('T')[0];
		var lastRefreshedDate = await getTokenValue(
			'IGDB_TOKEN_REFRESHED_DATE'
		);
		console.log('lastRefreshedDate: ', lastRefreshedDate);

		// if token not already refreshed today
		if (lastRefreshedDate != todayStr) {
			// "https://id.twitch.tv/oauth2/token?client_id=<CLIENT_ID>&client_secret=<CLIENT_SECRET>&grant_type=client_credentials"
			const clientId = getEnvValue('IGDB_CLIENT_ID');
			const clientSecret = getEnvValue('IGDB_CLIENT_SECRET');

			console.log('clientId: ', clientId);
			// console.log('clientSecret: ', clientSecret);

			if (clientId && clientSecret) {
				twitchAuthUrl = twitchAuthUrl
					.replace('<CLIENT_ID>', clientId)
					.replace('<CLIENT_SECRET>', clientSecret);
			}

			const response = await fetch(twitchAuthUrl, {
				method: 'POST',
			});
			const jsonRsp = await response.json();

			console.log('twitchAuthJsonRsp: ', jsonRsp);

			if (jsonRsp.access_token) {
				console.log(
					'Setting IGDB_TOKEN and IGDB_TOKEN_REFRESHED_DATE',
					jsonRsp
				);
				await setTokenValue('IGDB_TOKEN', jsonRsp.access_token);
				await setTokenValue('IGDB_TOKEN_REFRESHED_DATE', todayStr);
			}
		}
	}
}
