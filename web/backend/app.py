from flask import Flask, request, jsonify, send_from_directory, send_file
from PIL import Image, ImageDraw, ImageFont
from flask_cors import CORS
import mysql.connector
from config import DATABASE_CONFIG
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Connect to the database
def get_db_connection():
    try:
        conn = mysql.connector.connect(
            host=DATABASE_CONFIG["host"],
            port=DATABASE_CONFIG["port"],
            user=DATABASE_CONFIG["user"],
            password=DATABASE_CONFIG["password"],
            database=DATABASE_CONFIG["dbname"],
        )
        return conn
    except Exception as e:
        print(f"Error connecting to the database: {e}")
        return None


# Route to create a new user
@app.route('/create_user', methods=['POST'])
def create_user():
    try:
        data = request.json
        username = data.get('username')
        email = data.get('email')
        birthday = data.get('birthday')
        password = data.get('password')  # Ensure this is hashed in production

        if not username or not email or not birthday or not password:
            return jsonify({"error": "All fields are required"}), 400

        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500

        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO users (username, email, password, birthday)
            VALUES (%s, %s, %s, %s)
            """,
            (username, email, password, birthday),
        )
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({
            "message": "User created successfully",
            "user": {
                "username": username,
            }
        }), 201

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "An error occurred. Please try again."}), 500


# Route to sign in a user
@app.route('/sign_in', methods=['POST'])
def sign_in():
    try:
        data = request.json
        identifier = data.get('identifier')  # Can be username or email
        password = data.get('password')

        if not identifier or not password:
            return jsonify({"error": "Both identifier and password are required"}), 400

        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500

        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT id, username, admin
            FROM users
            WHERE (username = %s OR email = %s) AND password = %s
            """,
            (identifier, identifier, password),
        )
        user = cursor.fetchone()
        cursor.close()
        conn.close()

        if user:
            return jsonify({"message": "Sign in successful", "user": user}), 200
        else:
            return jsonify({"error": "Invalid credentials"}), 401

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Failed to sign in"}), 500


# Route to fetch posts from subscribed users
@app.route('/subscribed_posts', methods=['GET'])
def get_subscribed_posts():
    user_id = request.args.get('user_id')  # Logged-in user's ID

    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500

        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT 
                posts.id AS post_id, 
                posts.title, 
                posts.created_at, 
                posts.likes, 
                posts.views, 
                users.id AS user_id, 
                users.username
            FROM 
                posts
            JOIN 
                subscriptions ON subscriptions.user_id = posts.user_id
            JOIN 
                users ON users.id = posts.user_id
            WHERE 
                subscriptions.subscriber_id = %s
            ORDER BY 
                posts.created_at DESC
            """,
            (user_id,),
        )
        posts = cursor.fetchall()
        cursor.close()
        conn.close()

        return jsonify({"posts": posts}), 200

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Failed to fetch subscribed posts"}), 500


# Route to subscribe to a user
@app.route('/subscribe', methods=['POST'])
def subscribe():
    try:
        data = request.json
        user_id = data.get('user_id')  # The user being subscribed to
        subscriber_id = data.get('subscriber_id')  # The user subscribing

        if not user_id or not subscriber_id:
            return jsonify({"error": "user_id and subscriber_id are required"}), 400

        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500

        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO subscriptions (user_id, subscriber_id)
            VALUES (%s, %s)
            """,
            (user_id, subscriber_id),
        )
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Subscribed successfully"}), 201

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Failed to subscribe"}), 500


# Route to unsubscribe from a user
@app.route('/unsubscribe', methods=['POST'])
def unsubscribe():
    try:
        data = request.json
        user_id = data.get('user_id')  # The user being unsubscribed from
        subscriber_id = data.get('subscriber_id')  # The user unsubscribing

        if not user_id or not subscriber_id:
            return jsonify({"error": "user_id and subscriber_id are required"}), 400

        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500

        cursor = conn.cursor()
        cursor.execute(
            """
            DELETE FROM subscriptions
            WHERE user_id = %s AND subscriber_id = %s
            """,
            (user_id, subscriber_id),
        )
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Unsubscribed successfully"}), 200

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Failed to unsubscribe"}), 500

# Route to get user data
@app.route('/user/<int:user_id>', methods=['GET'])
def get_user_info(user_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT id, username, subscriber_count FROM users WHERE id = %s", 
            (user_id,)
        )
        user = cursor.fetchone()
        cursor.close()
        conn.close()

        if not user:
            return jsonify({"error": "User not found"}), 404

        return jsonify({"user": user}), 200
    except Exception as e:
        print(f"Error fetching user info: {e}")
        return jsonify({"error": "Internal server error"}), 500

# Route to get user posts
@app.route('/posts/<int:user_id>', methods=['GET'])
def get_user_posts(user_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT id, title, likes, views, created_at FROM posts WHERE user_id = %s",
            (user_id,)
        )
        posts = cursor.fetchall()
        cursor.close()
        conn.close()

        if not posts:
            return jsonify({"posts": []}), 200  # Return an empty list if no posts

        return jsonify({"posts": posts}), 200
    except Exception as e:
        print(f"Error fetching user posts: {e}")
        return jsonify({"error": "Internal server error"}), 500

# Route to update user info
@app.route('/user/<int:user_id>/update', methods=['POST'])
def update_user_info(user_id):
    try:
        data = request.json
        icon_url = data.get("icon_url")
        banner_url = data.get("banner_url")

        if not icon_url and not banner_url:
            return jsonify({"error": "No data to update"}), 400

        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500

        cursor = conn.cursor()

        if icon_url:
            cursor.execute(
                "UPDATE users SET icon_url = %s WHERE id = %s",
                (icon_url, user_id)
            )

        if banner_url:
            cursor.execute(
                "UPDATE users SET banner_url = %s WHERE id = %s",
                (banner_url, user_id)
            )

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "User updated successfully"}), 200

    except Exception as e:
        print(f"Error updating user info: {e}")
        return jsonify({"error": "An error occurred"}), 500

# Route to get subscriber count
@app.route('/user/<int:user_id>/subscribers', methods=['GET'])
def get_subscriber_count(user_id):
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500

        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT subscriber_count FROM users WHERE id = %s",
            (user_id,)
        )
        result = cursor.fetchone()
        cursor.close()
        conn.close()

        if not result:
            return jsonify({"error": "User not found"}), 404

        return jsonify(result), 200

    except Exception as e:
        print(f"Error fetching subscriber count: {e}")
        return jsonify({"error": "An error occurred"}), 500


@app.route("/create_meme", methods=["POST"])
def create_meme():
    try:
        if "image" not in request.files:
            return jsonify({"error": "Image file is required"}), 400

        image = request.files["image"]
        title = request.form.get("title", "")
        text = request.form.get("text", "").upper()  # Convert text to uppercase
        alignment = request.form.get("alignment", "bottom")
        user_id = request.form.get("user", None)

        if not title or not text or not user_id:
            return jsonify({"error": "All fields are required"}), 400

        # Save the uploaded image temporarily
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        original_filename = f"meme_{timestamp}_{image.filename}"
        original_path = os.path.join(UPLOAD_FOLDER, original_filename)
        image.save(original_path)

        # Open the image with Pillow
        img = Image.open(original_path)
        draw = ImageDraw.Draw(img)
        font_path = "impact.ttf"  # Path to the font file
        font_size = max(img.size[1] // 10, 24)  # Adjust font size relative to image height
        try:
            font = ImageFont.truetype(font_path, font_size)
        except OSError:
            return jsonify({"error": "Font file not found. Please add 'impact.ttf' to your project."}), 500

        # Calculate text position using textbbox
        text_bbox = draw.textbbox((0, 0), text, font=font)  # Get bounding box for the text
        text_width = text_bbox[2] - text_bbox[0]
        text_height = text_bbox[3] - text_bbox[1]

        x = (img.width - text_width) / 2  # Center horizontally
        y = 10 if alignment == "top" else img.height - text_height - 10  # Top or bottom alignment

        # Draw the text with a black outline for better visibility
        outline_range = 2  # Outline thickness
        for dx in range(-outline_range, outline_range + 1):
            for dy in range(-outline_range, outline_range + 1):
                draw.text((x + dx, y + dy), text, font=font, fill="black")
        draw.text((x, y), text, font=font, fill="white")  # Main text

        # Save the modified image
        updated_filename = f"meme_{timestamp}_updated.png"
        updated_path = os.path.join(UPLOAD_FOLDER, updated_filename)
        img.save(updated_path)

        # Save post details to the database
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500

        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO posts (user_id, title, created_at, likes, views, image_url)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (user_id, title, datetime.now(), 0, 0, f"/uploads/{updated_filename}"),
        )
        post_id = cursor.lastrowid

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({
            "message": "Meme created successfully!",
            "image_url": f"/uploads/{updated_filename}",
            "post_id": post_id,
        }), 201

    except Exception as e:
        print(f"Error creating meme: {e}")
        return jsonify({"error": "An error occurred while creating the meme."}), 500


@app.route("/uploads/<filename>")
def serve_uploaded_file(filename):
    """Serve uploaded images to the frontend."""
    file_path = os.path.join("..", UPLOAD_FOLDER, filename)
    try:
        return send_file(file_path, as_attachment=False)  # as_attachment=False serves it inline
    except FileNotFoundError:
        return "File not found", 404


@app.route("/get_memes", methods=["GET"])
def get_memes():
    """Fetch memes dynamically with pagination and subscribed user prioritization."""
    try:
        page = int(request.args.get("page", 1))
        user_id = request.args.get("user_id", None)
        memes_per_page = 50
        offset = (page - 1) * memes_per_page

        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500

        cursor = conn.cursor(dictionary=True)

        # If user is signed in, fetch subscribed users' memes first
        if user_id:
            cursor.execute(
                """
                SELECT posts.*, users.username AS creator_username
                FROM posts
                JOIN users ON posts.user_id = users.id
                WHERE posts.user_id IN (
                    SELECT user_id FROM subscriptions WHERE subscriber_id = %s
                )
                ORDER BY posts.created_at DESC
                LIMIT %s OFFSET %s
                """,
                (user_id, memes_per_page, offset),
            )
        else:
            # Otherwise, fetch the latest memes
            cursor.execute(
                """
                SELECT posts.*, users.username AS creator_username
                FROM posts
                JOIN users ON posts.user_id = users.id
                ORDER BY posts.created_at DESC
                LIMIT %s OFFSET %s
                """,
                (memes_per_page, offset),
            )

        memes = cursor.fetchall()
        cursor.close()
        conn.close()

        return jsonify({"memes": memes}), 200
    except Exception as e:
        print(f"Error fetching memes: {e}")
        return jsonify({"error": "An error occurred while fetching memes."}), 500


@app.route("/post/<int:post_id>", methods=["GET"])
def get_post(post_id):
    """Fetch post details by ID."""
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500

        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT posts.id, posts.title, posts.likes, posts.views, posts.image_url, 
                   users.username AS creator_username
            FROM posts
            JOIN users ON posts.user_id = users.id
            WHERE posts.id = %s
            """,
            (post_id,),
        )
        post = cursor.fetchone()

        if not post:
            return jsonify({"error": "Post not found"}), 404

        # Increment views count
        cursor.execute("UPDATE posts SET views = views + 1 WHERE id = %s", (post_id,))
        conn.commit()

        cursor.close()
        conn.close()

        return jsonify({"post": post}), 200

    except Exception as e:
        print(f"Error fetching post: {e}")
        return jsonify({"error": "An error occurred while fetching the post."}), 500


@app.route("/post/<int:post_id>/like", methods=["POST"])
def like_post(post_id):
    """Increment the like count for a post."""
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500

        cursor = conn.cursor()
        cursor.execute("UPDATE posts SET likes = likes + 1 WHERE id = %s", (post_id,))
        conn.commit()

        cursor.close()
        conn.close()

        return jsonify({"message": "Post liked successfully!"}), 200

    except Exception as e:
        print(f"Error liking post: {e}")
        return jsonify({"error": "An error occurred while liking the post."}), 500


# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=5000)
