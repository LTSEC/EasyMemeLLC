from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2  # PostgreSQL driver
from config import DATABASE_CONFIG

app = Flask(__name__)
CORS(app)

# Connect to the database
def get_db_connection():
    try:
        conn = psycopg2.connect(
            host=DATABASE_CONFIG["host"],
            port=DATABASE_CONFIG["port"],
            user=DATABASE_CONFIG["user"],
            password=DATABASE_CONFIG["password"],
            dbname=DATABASE_CONFIG["dbname"],
        )
        return conn
    except Exception as e:
        print(f"Error connecting to the database: {e}")
        return None

@app.route('/create_user', methods=['POST'])
def create_user():
    try:
        data = request.json
        username = data.get('username')
        email = data.get('email')
        birthday = data.get('birthday')
        password = data.get('password')  # Ensure this is hashed in production

        # Log incoming data for debugging
        print(f"Received data: {data}")

        # Check if all fields are provided
        if not username or not email or not birthday or not password:
            print("Missing required fields")
            return jsonify({"error": "All fields are required"}), 400

        # Connect to the database
        conn = get_db_connection()
        if not conn:
            print("Database connection failed")
            return jsonify({"error": "Database connection failed"}), 500

        # Insert the user into the database
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO users (username, email, birthday, password)
            VALUES (%s, %s, %s, %s)
            """,
            (username, email, birthday, password)
        )
        conn.commit()
        cursor.close()
        conn.close()

        print("User created successfully")
        return jsonify({"message": "User created successfully"}), 201

    except Exception as e:
        print(f"Error: {e}")  # Log the error
        return jsonify({"error": "An error occurred. Please try again."}), 500


@app.route('/sign_in', methods=['POST'])
def sign_in():
    # Get the request data
    data = request.json
    identifier = data.get('identifier')  # Can be username or email
    password = data.get('password')

    # Ensure all required fields are provided
    if not identifier or not password:
        return jsonify({"error": "Both identifier and password are required"}), 400

    # Query the database for the user
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT * FROM users
            WHERE (username = %s OR email = %s) AND password = %s
            """,
            (identifier, identifier, password)
        )
        user = cursor.fetchone()
        cursor.close()
        conn.close()

        if user:
            return jsonify({"message": "Sign in successful", "username": user[1]}), 200
        else:
            return jsonify({"error": "Invalid credentials"}), 401
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Failed to sign in"}), 500

# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True)
