const axios = require('axios');
const fs = require('fs');
const dotenv = require('dotenv');
const { DateTime } = require('luxon');
const {OpenAI} = require('openai');

dotenv.config();

async function getToken() {
    // Load environment variables
    const tokenUrl = process.env.TOKEN_URL;
    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;
    const scope = process.env.SCOPE;

    // Define the payload
    const payload = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        scope: scope
    });

    // Make the POST request
    const response = await axios.post(tokenUrl, payload, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const token = response.data.access_token;
    const timeGenerated = DateTime.now().toISO();

    // Update the .env file with the new token
    const envFilePath = '.env';
    const envFileContent = fs.readFileSync(envFilePath, 'utf8');
    const envFileLines = envFileContent.split('\n');
    const updatedEnvFileLines = envFileLines.map(line => {
        if (line.startsWith('OPENAI_API_KEY=')) {
            return `OPENAI_API_KEY=${token}`;
        } else if (line.startsWith('TIME_GENERATED=')) {
            return `TIME_GENERATED=${timeGenerated}`;
        } else {
            return line;
        }
    });

    fs.writeFileSync(envFilePath, updatedEnvFileLines.join('\n'));

    return token;
}

let timeGenerated = DateTime.now().toISO();
//let token = getToken();

async function getOpenAIClient() {
    // Load environment variables from .env file
    dotenv.config();
    const client = new OpenAI({
        baseUrl: process.env.DEERE_AI_GATEWAY
    });

    //return client;

    const timeGeneratedStr = process.env.TIME_GENERATED;
    timeGenerated = DateTime.fromISO(timeGeneratedStr);
    if (timeGenerated.plus({ minutes: 60 }) < DateTime.now()) {
        token = await getToken();
    } else {
        token = process.env.OPENAI_API_KEY;
    }
    client.apiKey = token;
    client.baseUrl = process.env.DEERE_AI_GATEWAY;
    return client;
}

module.exports = {
    getOpenAIClient,
    getToken
};