import axios from 'axios';
import dotenv from "dotenv";
import { promises as fs } from 'fs';

export async function generateToken() {
    try {
        dotenv.config();
        const tokenUrl = process.env.TOKEN_URL;
        const clientId = process.env.CLIENT_ID;
        const clientSecret = process.env.CLIENT_SECRET;
        const scope = process.env.SCOPE;
        const timeGeneratedStr = process.env.TIME_GENERATED;
        var timeGenerated = new Date(timeGeneratedStr);
        const currentTime = new Date();

        // Check if the token is older than 60 minutes
        if (timeGenerated.getTime() + 60 * 60 * 1000 > currentTime.getTime())
            return;

        // Define the payload
        const payload = new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret,
            scope: scope,
        });

        // Make the POST request
        const response = await axios.post(tokenUrl, payload.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const token = response.data.access_token;
        timeGenerated = new Date().toISOString();

        // Read the current .env file
        const envData = await fs.readFile('.env', 'utf8');
        const envLines = envData.split('\n');

        // Update the OPENAI_API_KEY and TIME_GENERATED in the .env file
        const updatedEnv = envLines.map((line) => {
            if (line.startsWith('OPENAI_API_KEY=')) {
                return `OPENAI_API_KEY=${token}`;
            } else if (line.startsWith('TIME_GENERATED=')) {
                return `TIME_GENERATED=${timeGenerated}`;
            } else {
                return line;
            }
        });
        // Write the updated .env file
        await fs.writeFile('.env', updatedEnv.join('\n'), 'utf8');
        // Reload environment variables
        dotenv.config();
        return token
    } catch (error) {
        console.error('Error getting token:', error.response ? error.response.data : error.message);
        throw error;
    }
}
