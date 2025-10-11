type TokenKeys = 'IGDB_TOKEN' | 'IGDB_TOKEN_REFRESHED_DATE';

type TokenStore = Partial<Record<TokenKeys, string>>;

// Use Nitro storage: persisted depending on runtime driver
// Keys will live under the root storage namespace with igdb: prefix
export async function getTokenValue(key: TokenKeys): Promise<string | null> {
	// @ts-ignore provided by Nitro at runtime
	const storage = useStorage('igdb');
	const val = await storage.getItem<string>(key);
	return val ?? null;
}

export async function setTokenValue(
	key: TokenKeys,
	value: string
): Promise<void> {
	// @ts-ignore provided by Nitro at runtime
	const storage = useStorage('igdb');
	await storage.setItem(key, value);
}
