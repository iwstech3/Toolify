import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

# Configuration
API_URL = "http://localhost:8000/api/generate-manual"
# You'll need a valid Clerk token for this to work if running against a live server
# For local testing without auth, you might need to mock get_current_user
TOKEN = os.getenv("TEST_CLERK_TOKEN") 

def test_generate_manual_text():
    print("Testing manual generation with tool name...")
    payload = {
        "tool_name": "Hammer",
        "language": "en",
        "generate_audio": "false"
    }
    
    headers = {
        "Authorization": f"Bearer {TOKEN}"
    }
    
    try:
        response = requests.post(API_URL, data=payload, headers=headers)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print("Success!")
            print(f"Tool: {data.get('tool_name')}")
            print(f"Summary: {data.get('summary')[:100]}...")
            print(f"Session ID: {data.get('session_id')}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    if not TOKEN:
        print("Please set TEST_CLERK_TOKEN in your .env file or environment.")
    else:
        test_generate_manual_text()
