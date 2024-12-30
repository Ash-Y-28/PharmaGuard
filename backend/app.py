import warnings
from werkzeug.exceptions import HTTPException
from flask import Flask, jsonify, request, render_template, redirect, url_for
import pandas as pd
import os
import requests
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask_cors import CORS
import jwt
import datetime

def generate_otp():
    return str(random.randint(100000, 999999))

def send_email(recipient_email, subject, otp):
    sender_email = "team.pharmaguard@gmail.com"
    sender_password = "uuyeboymdmarncor"

    html_body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
                <td align="center">
                    <table width="600px" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                        <tr>
                            <td align="center" style="padding-bottom: 20px;">
                                <img src="https://i.imgur.com/LTuXkir.jpeg" alt="PharmaGuard Banner" style="width: 100%; height: auto;">
                            </td>
                        </tr>
                        <tr>
                            <td style="font-size: 16px; line-height: 1.5; color: #333333; text-align: left;">
                                <p>Dear User,</p>
                                <p>Thank you for signing up with <strong>PharmaGuard</strong>!</p>
                                <p>Your OTP to complete the registration process is:</p>
                                <p style="font-size: 24px; font-weight: bold; text-align: center; color: #007BFF;">{otp}</p>
                                <p>If you did not request this, please ignore this email.</p>
                                <p style="margin-top: 20px;">Best regards,<br>The PharmaGuard Team</p>
                            </td>
                        </tr>
                        <tr>
                            <td align="center" style="padding-top: 20px; font-size: 12px; color: #888888;">
                                <p>&copy; 2024 PharmaGuard. All rights reserved.</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """

    msg = MIMEMultipart('alternative')
    msg["Subject"] = subject
    msg["From"] = sender_email
    msg["To"] = recipient_email

    msg.attach(MIMEText(html_body, "html"))

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, [recipient_email], msg.as_string())
        print("Email sent successfully!")
    except Exception as e:
        print(f"Error sending email: {e}")

warnings.filterwarnings("ignore", category=UserWarning, module="werkzeug")

app = Flask(__name__, template_folder='../frontend/templates', static_folder='../frontend/static')

app.config['SECRET_KEY'] = "15f396b86a416e88b49d40ad6805be6510312cc0c1ac04c1244cc75bc0c26aa3"

CORS(app)

@app.route('/')
def index():
    return render_template('login.html')

@app.route('/check_username', methods=['GET'])
def check_username():
    username = request.args.get('username', '').strip()

    if not username:
        return jsonify({'available': False, 'suggestions': []}), 400

    try:
        conn = sqlite3.connect('backend/users.db')
        cursor = conn.cursor()

        cursor.execute("SELECT username FROM users WHERE username = ?", (username,))
        user = cursor.fetchone()
        conn.close()

        if user:
            suggestions = [
                f"{username}{random.randint(100, 999)}",
                f"{username}_{random.randint(10, 99)}",
                f"{username}{random.choice(['123', 'xyz', 'abc'])}"
            ]
            return jsonify({'available': False, 'suggestions': suggestions}), 200
        else:
            return jsonify({'available': True, 'suggestions': []}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/check_email', methods=['GET'])
def check_email():
    email = request.args.get('email', '').strip()

    if not email:
        return jsonify({'exists': False}), 400

    try:
        conn = sqlite3.connect('backend/users.db')
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
        user = cursor.fetchone()
        conn.close()

        if user:
            return jsonify({'exists': True}), 200
        else:
            return jsonify({'exists': False}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.json
        username = data.get('username')
        password = generate_password_hash(data.get('password'))
        email = data.get('email')

        if not username or not password or not email:
            return jsonify({'error': 'All fields are required'}), 400

        otp = generate_otp()
        pending_user = {'username': username, 'password': password, 'email': email, 'otp': otp}

        token = jwt.encode(
            {
                'pending_user': pending_user,
                'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=10)
            },
            app.config['SECRET_KEY'],
            algorithm="HS256"
        )

        send_email(email, "Your OTP for PharmaGuard Registration", otp)

        return jsonify({'message': 'OTP sent successfully!', 'token': token}), 200
    except Exception as e:
        print("Error in /register:", str(e))
        return jsonify({'error': 'Failed to register'}), 500

@app.route('/verify_otp', methods=['POST'])
def verify_otp():
    try:
        data = request.json
        token = data.get('token')
        user_otp = data.get('otp')

        decoded_data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
        pending_user = decoded_data.get('pending_user')

        if not pending_user:
            return jsonify({'error': 'No pending registration found'}), 400

        if user_otp == pending_user['otp']:
            conn = sqlite3.connect('backend/users.db')
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO users (username, password, email) VALUES (?, ?, ?)",
                (pending_user['username'], pending_user['password'], pending_user['email'])
            )
            conn.commit()
            conn.close()

            return jsonify({'message': 'Registration successful!'}), 200
        else:
            return jsonify({'error': 'Invalid OTP'}), 400
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token has expired'}), 400
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Invalid token'}), 400
    except Exception as e:
        print("Error in /verify_otp:", str(e))
        return jsonify({'error': 'Failed to verify OTP'}), 500
    
@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return jsonify({'error': 'Username and password are required'}), 400

        # Verify user in the database
        conn = sqlite3.connect('backend/users.db')
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
        user_record = cursor.fetchone()
        conn.close()

        if user_record is None:
            return jsonify({'error': 'Invalid credentials'}), 401

        hashed_pw_in_db = user_record[2]
        if not check_password_hash(hashed_pw_in_db, password):
            return jsonify({'error': 'Invalid credentials'}), 401

        # Generate a JWT token for the user
        token = jwt.encode(
            {'username': username, 'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)},
            app.config['SECRET_KEY'],
            algorithm="HS256"
        )

        return jsonify({'message': 'Login successful', 'token': token}), 200
    except Exception as e:
        print("Error in /login:", str(e))
        return jsonify({'error': 'Failed to login'}), 500

@app.route('/guest_login', methods=['POST'])
def guest_login():
    try:
        # Generate a guest token
        token = jwt.encode(
            {'username': 'guest', 'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)},
            app.config['SECRET_KEY'],
            algorithm="HS256"
        )

        return jsonify({'message': 'Guest login successful', 'token': token}), 200
    except Exception as e:
        print("Error in /guest_login:", str(e))
        return jsonify({'error': 'Failed to login as guest'}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5003)
