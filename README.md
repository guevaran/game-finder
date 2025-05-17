# Game Finder

What to play? With Game Finder, discover your next video game to play!
Game Finder is an open source web app that gives ideas of what video game to play.

Try it: [Game Finder](https://www.game-finder.guev.fr/)

## Author

[Nicolas Guevara](https://nicolas.guev.fr/)

<a href='https://ko-fi.com/nicolasguevara' target='_blank'><img height='35' style='border:0px;height:46px;' src='https://az743702.vo.msecnd.net/cdn/kofi3.png?v=0' border='0' alt='Buy Me a Coffee at ko-fi.com' />

## Data source

Game Finder uses data from [IGDB](https://www.igdb.com/).

## Setup locally

1. Clone the repo : `git clone https://github.com/guevaran/game-finder.git`
2. Follow account creation of [IGDB documentation](https://api-docs.igdb.com/#account-creation)
3. Create a file `.env` at project root with content :

```plaintext
IGDB_API_BASE_URL="https://api.igdb.com/v4"
IGDB_TWITCH_AUTH_URL="https://id.twitch.tv/oauth2/token?client_id=<CLIENT_ID>&client_secret=<CLIENT_SECRET>&grant_type=client_credentials"
IGDB_CLIENT_ID="<IGDB_CLIENT_ID>"
IGDB_CLIENT_SECRET="<IGDB_CLIENT_SECRET>"
```

6. Install the dependencies:

```bash
# npm
npm install
# pnpm
pnpm install
# yarn
yarn install
# bun
bun install
```

7. Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev
# pnpm
pnpm run dev
# yarn
yarn dev
# bun
bun run dev
```

## IGDB Token Refresh

FYI the server/autoRefreshToken.ts script runs on weekly basis while the server is running in order to refresh the access token of IGDB that has an expiration date.
