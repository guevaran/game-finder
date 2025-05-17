import fs from 'fs';
import path from 'path';
import os from 'os';

const envFilePath = path.resolve('.env');

/**
 * Reads .env file & converts to array
 * @returns {string[]} Array of env file lines
 */
export const readEnvVars = () => {
	return fs.readFileSync(envFilePath, 'utf-8').split(os.EOL);
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
	// find the line that contains the key (exact match)
	const matchedLine = envVars.find((line) => line.split('=')[0] === key);

	// split the line (delimiter is '=') and return the item at index 2
	if (matchedLine !== undefined) {
		const [k, ...tvalue] = matchedLine.split('=');
		let value = tvalue.join('=');
		// Remove quotes from beginning and end if they exist
		value = value.replace(/^["']|["']$/g, '');
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

	const targetLine = envVars.find((line) => line.split('=')[0] === key);

	if (targetLine !== undefined) {
		// update existing line
		const targetLineIndex = envVars.indexOf(targetLine);
		// replace the key/value with the new value
		envVars.splice(targetLineIndex, 1, `${key}="${value}"`);
	} else {
		// create new key value
		envVars.push(`${key}="${value}"`);
	}

	// write everything back to the file system
	fs.writeFileSync(envFilePath, envVars.join(os.EOL));
};
