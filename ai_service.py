from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

app = Flask(__name__)
# Enable CORS for all routes with specific origins
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Initialize OpenAI with API key from environment variable
openai.api_key = os.getenv('OPENAI_API_KEY')

@app.route('/api/chat', methods=['POST'])
def chat():
    if not openai.api_key:
        return jsonify({
            "error": "OpenAI API key not configured",
            "success": False
        }), 500

    try:
        data = request.get_json()
        if not data:
            return jsonify({
                "error": "No data provided",
                "success": False
            }), 400

        user_message = data.get('message')
        if not user_message:
            return jsonify({
                "error": "No message provided",
                "success": False
            }), 400

        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful shopping assistant."},
                {"role": "user", "content": user_message}
            ],
            max_tokens=150
        )
        
        return jsonify({
            "response": response.choices[0].message.content,
            "success": True
        })
    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")  # Add logging
        return jsonify({
            "error": str(e),
            "success": False
        }), 500

@app.route('/api/test', methods=['GET'])
def test_api():
    try:
        return jsonify({
            "message": "API is working",
            "openai_configured": bool(openai.api_key),
            "success": True
        })
    except Exception as e:
        print(f"Error in test endpoint: {str(e)}")  # Add logging
        return jsonify({
            "error": str(e),
            "success": False
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000) 