import requests
import os
from openai import OpenAI
from dotenv import load_dotenv
from datetime import datetime, timedelta

def generateToken():
    load_dotenv()
    time_generated_str = os.getenv("TIME_GENERATED")
    TimeGenerated = datetime.fromisoformat(time_generated_str)
    if TimeGenerated + timedelta(minutes=60) < datetime.now():
        token_url = os.getenv("TOKEN_URL")
        client_id = os.getenv("CLIENT_ID")
        client_secret = os.getenv("CLIENT_SECRET")
        scope = os.getenv("SCOPE")
        # Define the payload
        payload = {
            "grant_type": "client_credentials",
            "client_id": client_id,
            "client_secret": client_secret,
            "scope": scope
        }
        # Make the POST request
        response = requests.post(token_url, data=payload, headers={"Content-Type": "application/x-www-form-urlencoded"})
        token = response.json().get('access_token')
        TimeGenerated = datetime.now()
        # Update the .env file with the new token
        with open('.env', 'r') as file:
            lines = file.readlines()
        with open('.env', 'w') as file:
            for line in lines:
                if line.startswith("OPENAI_API_KEY="):
                    file.write(f"OPENAI_API_KEY={token}\n")
                elif line.startswith("TIME_GENERATED="):
                    file.write(f"TIME_GENERATED={TimeGenerated}\n")
                else:
                    file.write(line)    
        os.environ.pop("OPENAI_API_KEY", None)                
        load_dotenv()    
