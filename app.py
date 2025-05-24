from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import os
import bcrypt
import requests
from dotenv import load_dotenv
from ai_service import chat, test_api
import openai
import json
from pathlib import Path
from typing import Dict

load_dotenv()

app = Flask(__name__, static_folder='build', static_url_path='/')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key')
jwt = JWTManager(app)

# Initialize OpenAI
openai.api_key = os.getenv('OPENAI_API_KEY')

# Google Pay Configuration
GOOGLE_MERCHANT_ID = os.getenv('GOOGLE_MERCHANT_ID')

CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Register AI endpoints
app.add_url_rule('/api/test', 'test_api', test_api, methods=['GET'])

# Mock user database (replace with actual database)
USERS = {}

FAKE_STORE_API = "https://fakestoreapi.com"

def format_product(product: Dict) -> Dict:
    """Format Fake Store API product to match our schema"""
    return {
        "id": str(product["id"]),
        "name": product["title"],
        "price": float(product["price"]),
        "image": product["image"],
        "description": product["description"],
        "category": product["category"],
        "features": [product["category"], *product["description"].lower().split()[:5]],
    }

def load_products():
    """Load products from Fake Store API"""
    try:
        response = requests.get(f"{FAKE_STORE_API}/products")
        if response.status_code == 200:
            products = response.json()
            formatted_products = [format_product(p) for p in products]
            print(f"Loaded {len(formatted_products)} products from Fake Store API")
            return formatted_products
    except Exception as e:
        print(f"Error loading products from Fake Store API: {str(e)}")
    
    return []

# Initialize products
PRODUCTS = load_products()

@app.route('/api/reload-products', methods=['POST'])
def reload_products():
    """Reload products from Fake Store API"""
    global PRODUCTS
    try:
        PRODUCTS = load_products()
        return jsonify({
            'success': True,
            'message': f'Successfully loaded {len(PRODUCTS)} products'
        })
    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500

@app.route('/')
def serve():
    """Serve React App"""
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
            
        if email in USERS:
            return jsonify({'error': 'User already exists'}), 400
            
        # Hash password
        hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        USERS[email] = {
            'password': hashed,
            'cart': []
        }
        
        # Create access token
        access_token = create_access_token(identity=email)
        
        return jsonify({
            'success': True,
            'access_token': access_token
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    """Login user"""
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
            
        if email not in USERS:
            return jsonify({'error': 'Invalid credentials'}), 401
            
        if not bcrypt.checkpw(password.encode('utf-8'), USERS[email]['password']):
            return jsonify({'error': 'Invalid credentials'}), 401
            
        access_token = create_access_token(identity=email)
        
        return jsonify({
            'success': True,
            'access_token': access_token
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/products', methods=['GET'])
def get_products():
    """Get all products with optional category filter"""
    category = request.args.get('category')
    if category:
        filtered_products = [p for p in PRODUCTS if p['category'].lower() == category.lower()]
        return jsonify(filtered_products)
    return jsonify(PRODUCTS)

@app.route('/api/categories', methods=['GET'])
def get_categories():
    """Get all unique product categories"""
    categories = list(set(p['category'] for p in PRODUCTS))
    return jsonify(categories)

@app.route('/api/search', methods=['POST'])
def search():
    """Text-based product search endpoint"""
    try:
        data = request.json
        if not data:
            return jsonify({
                'success': False,
                'error': 'No request data provided'
            }), 400
            
        query = data.get('query', '').lower()
        print(f"Received search query: {query}")  # Debug log
        
        if not query:
            return jsonify({
                'success': False,
                'error': 'No search query provided'
            }), 400
            
        # Extract color terms
        common_colors = ['pink', 'red', 'blue', 'green', 'black', 'white', 'yellow', 'purple', 'orange', 'brown']
        colors = [color for color in common_colors if color in query]
        print(f"Detected colors: {colors}")  # Debug log
        
        # Extract category terms
        categories = list(set(p['category'] for p in PRODUCTS))
        found_categories = [cat for cat in categories if cat.lower() in query]
        print(f"Detected categories: {found_categories}")  # Debug log
        
        # Search through products
        matched_products = []
        for product in PRODUCTS:
            try:
                product_text = ' '.join([
                    product.get('name', '').lower(),
                    product.get('description', '').lower(),
                    product.get('category', '').lower()
                ])
                
                # Calculate match score based on colors, categories, and general terms
                score = 0
                
                # Check for color matches
                if colors:
                    if any(color in product_text for color in colors):
                        score += 2
                        
                # Check for category matches
                if found_categories:
                    if product.get('category', '').lower() in [cat.lower() for cat in found_categories]:
                        score += 2
                
                # Check for general term matches
                if any(term in product_text for term in query.split()):
                    score += 1
                    
                if score > 0:
                    matched_product = product.copy()  # Create a copy to avoid modifying original
                    matched_product['_score'] = score
                    matched_products.append(matched_product)
                    
            except Exception as product_error:
                print(f"Error processing product: {product.get('id', 'unknown')}, Error: {str(product_error)}")
                continue
        
        print(f"Found {len(matched_products)} matching products")  # Debug log
        
        # Sort by score
        matched_products.sort(key=lambda x: x.get('_score', 0), reverse=True)
        
        # Remove score before sending
        for product in matched_products:
            if '_score' in product:
                del product['_score']
            
        response_data = {
            'success': True,
            'products': matched_products,
            'message': f"Found {len(matched_products)} products matching your search.",
            'metadata': {
                'colors': colors,
                'categories': found_categories
            }
        }
        
        return jsonify(response_data)
    
    except Exception as e:
        print(f"Search error: {str(e)}")  # Error log
        return jsonify({
            'success': False,
            'error': f"Search failed: {str(e)}"
        }), 500

@app.route('/api/cart', methods=['GET', 'POST', 'DELETE'])
@jwt_required()
def manage_cart():
    """Manage user's shopping cart"""
    current_user = get_jwt_identity()
    
    if request.method == 'GET':
        return jsonify(USERS[current_user]['cart'])
        
    elif request.method == 'POST':
        data = request.json
        product_id = data.get('product_id')
        quantity = data.get('quantity', 1)
        
        product = next((p for p in PRODUCTS if p['id'] == product_id), None)
        if not product:
            return jsonify({'error': 'Product not found'}), 404
            
        cart_item = {
            'product': product,
            'quantity': quantity
        }
        
        USERS[current_user]['cart'].append(cart_item)
        return jsonify({'success': True, 'cart': USERS[current_user]['cart']})
        
    elif request.method == 'DELETE':
        data = request.json
        product_id = data.get('product_id')
        
        USERS[current_user]['cart'] = [
            item for item in USERS[current_user]['cart']
            if item['product']['id'] != product_id
        ]
        
        return jsonify({'success': True, 'cart': USERS[current_user]['cart']})

@app.route('/api/google-pay', methods=['POST'])
@jwt_required()
def google_pay():
    """Handle Google Pay payment."""
    try:
        data = request.json
        current_user = get_jwt_identity()
        payment_data = data.get('paymentData')

        if not payment_data:
            return jsonify({'error': 'Payment data is required'}), 400

        # Process the payment with your payment processor
        # For now, we'll just simulate success
        
        # Clear cart after successful payment
        USERS[current_user]['cart'] = []

        return jsonify({
            'success': True,
            'message': 'Payment processed successfully'
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/search/products', methods=['POST'])
def search_products():
    """Smart product search endpoint"""
    try:
        data = request.json
        query = data.get('query', '').lower()
        current_filters = data.get('filters', [])

        if not query:
            return jsonify({
                'success': False,
                'error': 'No search query provided'
            }), 400

        # Extract search terms
        search_terms = query.split()
        
        # Search through products
        matched_products = []
        for product in PRODUCTS:
            product_text = ' '.join([
                product['name'].lower(),
                product['description'].lower(),
                product['category'].lower(),
                *[f.lower() for f in product['features']]
            ])
            
            # Calculate match score
            term_matches = sum(1 for term in search_terms if term in product_text)
            feature_matches = sum(1 for feature in current_filters if feature.lower() in product_text)
            
            if term_matches > 0 or feature_matches > 0:
                matched_products.append({
                    **product,
                    '_score': (term_matches * 2) + feature_matches
                })

        # Sort by score
        matched_products.sort(key=lambda x: x['_score'], reverse=True)
        
        # Remove score before sending
        for product in matched_products:
            del product['_score']

        return jsonify({
            'success': True,
            'products': matched_products,
            'suggestedFilters': current_filters
        })

    except Exception as e:
        print(f"Error in product search: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    """AI Chat endpoint"""
    try:
        data = request.json
        user_message = data.get('message', '').lower()
        user_preferences = data.get('userPreferences', {})
        
        # Extract search terms
        common_colors = ['pink', 'red', 'blue', 'green', 'black', 'white', 'yellow', 'purple', 'orange', 'brown']
        colors = [color for color in common_colors if color in user_message]
        
        # Extract categories
        categories = list(set(p['category'] for p in PRODUCTS))
        found_categories = [cat for cat in categories if cat.lower() in user_message]
        
        # Search through products
        recommendations = []
        for product in PRODUCTS:
            product_text = ' '.join([
                product['name'].lower(),
                product['description'].lower(),
                product['category'].lower()
            ])
            
            # Calculate relevance score
            score = 0
            
            # Color matching
            if colors and any(color in product_text for color in colors):
                score += 2
                
            # Category matching
            if found_categories and product['category'].lower() in [cat.lower() for cat in found_categories]:
                score += 2
                
            # General term matching
            if any(term in product_text for term in user_message.split()):
                score += 1
                
            if score > 0:
                recommendations.append({
                    **product,
                    '_score': score
                })
        
        # Sort by relevance
        recommendations.sort(key=lambda x: x['_score'], reverse=True)
        
        # Generate response
        response_text = ""
        if recommendations:
            if colors and found_categories:
                response_text = f"I found {len(recommendations)} {', '.join(colors)} items in the {', '.join(found_categories)} category. "
            elif colors:
                response_text = f"I found {len(recommendations)} {', '.join(colors)} items. "
            elif found_categories:
                response_text = f"I found {len(recommendations)} items in the {', '.join(found_categories)} category. "
            else:
                response_text = f"I found {len(recommendations)} items that match your search. "
            
            if recommendations:
                top_item = recommendations[0]
                response_text += f"For example, '{top_item['name']}' priced at ${top_item['price']}. "
                
            response_text += "Would you like to see more details about any of these items?"
        else:
            response_text = "I couldn't find any products matching your criteria. Could you try describing what you're looking for differently? For example, you can specify a color, category, or style."
        
        # Remove scores before sending
        for product in recommendations:
            del product['_score']
        
        return jsonify({
            'success': True,
            'response': response_text,
            'context': {
                'products': [p['name'] for p in recommendations[:5]],
                'categories': found_categories,
                'colors': colors
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Error handler for 404
@app.errorhandler(404)
def not_found(e):
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(debug=True) 