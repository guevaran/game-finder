import fs from 'fs';
import path from 'path';
import os from 'os';

const envFilePath = path.resolve('.env');

/**
 * Reads .env file and returns non-empty lines with normalized EOL.
 * - Supports both LF and CRLF
 * - Filters out blank lines to avoid inserting empty entries on write
 */
export const readEnvVars = (): string[] => {
	if (!fs.existsSync(envFilePath)) return [];
	const raw = fs.readFileSync(envFilePath, 'utf-8');
	// Normalize EOL to \n, then split
	const lines = raw.replace(/\r\n/g, '\n').split('\n');
	// Filter out purely empty lines
	return lines.filter((line) => line.trim().length > 0);
};

/**
 * Finds the key in .env files and returns the corresponding value
 * with quotes removed from beginning and end
 *
 * @param {string} key Key to find
 * @returns {string|null} Value of the key with quotes removed
 */
export const getEnvValue = (key: string) => {
	const envVars = readEnvVars();
	// find the line that contains the key (exact match on trimmed key)
	const matchedLine = envVars.find(
		(line) => line.split('=')[0].trim() === key
	);

	if (matchedLine !== undefined) {
		const [, ...tvalue] = matchedLine.split('=');
		let value = tvalue.join('=');
		// Remove quotes from beginning and end if they exist
		value = value.replace(/^\s*["']|["']\s*$/g, '');
		return value;
	}

	return null;
};

/**
 * Updates value for existing key or creates a new key=value line
 * @param {string} key Key to update/insert
 * @param {string} value Value to update/insert
 */
export const setEnvValue = (key: string, value: string) => {
	const envVars = readEnvVars();

	// Find index by trimmed key match
	const idx = envVars.findIndex((line) => line.split('=')[0].trim() === key);

	if (idx !== -1) {
		// update existing line
		envVars[idx] = `${key}="${value}"`;
	} else {
		// create new key value at the end (no blank spacer)
		envVars.push(`${key}="${value}"`);
	}

	// Write back with a single trailing newline, consistent EOL
	const content = envVars.join(os.EOL) + os.EOL;
	fs.writeFileSync(envFilePath, content, 'utf-8');
};
