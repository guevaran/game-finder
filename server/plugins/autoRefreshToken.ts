import { useScheduler } from "#scheduler"
import fs from "fs"
import path from "path"
import os from "os"


export default defineNitroPlugin(() => {
    startScheduler()
})

function startScheduler() {
    const scheduler = useScheduler();

    // scheduler.run(async () => {
    //     console.log("--- I run every 30 seconds ---")
    // }).everySeconds(30);


    scheduler.run(async () => {
        console.log("--- Auto refresh token every weeks ---");

        var twitchAuthUrl = getEnvValue('IGDB_TWITCH_AUTH_URL')
        if (twitchAuthUrl) {
            const todayStr = new Date().toISOString().split('T')[0]
            var lastRefreshedDate = getEnvValue('IGDB_TOKEN_REFRESHED_DATE')
            // Remove \" at beginning and end
            lastRefreshedDate = (lastRefreshedDate) ? lastRefreshedDate.slice(1, -1) : null

            // if token not already refreshed today
            if (lastRefreshedDate != todayStr) {
                const response = await fetch(twitchAuthUrl.slice(1, -1), {
                    method: 'POST',
                })
                const jsonRsp = await response.json()
                console.log("twitchAuthJsonRsp ", jsonRsp)

                if (jsonRsp.access_token) {
                    console.log("Setting IGDB_TOKEN and IGDB_TOKEN_REFRESHED_DATE", jsonRsp)
                    setEnvValue('IGDB_TOKEN', jsonRsp.access_token)
                    setEnvValue('IGDB_TOKEN_REFRESHED_DATE', todayStr)
                }
            }
        }

        // }).cron('0 0 0 */59 * *'); // ERROR  [worker reload] [worker init] */59 is a invalid expression for day of month 
        // }).everyDays(59); // ERROR  [worker reload] [worker init] */59 is a invalid expression for day of month 
        // }).cron('0 0 0 1 * *');
    }).weekly;
}

const envFilePath = path.resolve(".env");

// read .env file & convert to array
const readEnvVars = () => {
    return fs.readFileSync(envFilePath, "utf-8").split(os.EOL)
}

/**
 * Finds the key in .env files and returns the corresponding value
 *
 * @param {string} key Key to find
 * @returns {string|null} Value of the key
 */
const getEnvValue = (key: string) => {
    const envVars = readEnvVars()
    // find the line that contains the key (exact match)
    const matchedLine = envVars.find((line) => line.split("=")[0] === key);

    // split the line (delimiter is '=') and return the item at index 2
    if (matchedLine !== undefined) {
        const [k, ...tvalue] = matchedLine.split("=")
        return tvalue.join("=")
    }

    return null
}

/**
 * Updates value for existing key or creates a new key=value line
 * @param {string} key Key to update/insert
 * @param {string} value Value to update/insert
 */
const setEnvValue = (key: string, value: string) => {
    const envVars = readEnvVars()

    const targetLine = envVars.find((line) => line.split("=")[0] === key)

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
}