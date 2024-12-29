import warnings
from werkzeug.exceptions import HTTPException
from flask import Flask, jsonify, request, render_template, redirect, url_for, session
import pandas as pd
import os
import requests
from werkzeug.security import generate_password_hash
import sqlite3
import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import send_from_directory
from flask_cors import CORS

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
CORS(app, supports_credentials=True)

@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response

app.secret_key = os.urandom(24)
FDA_API_KEY = 'wDAtQe86UDtlfEkAjCS4uBBbvBZDCKAt8gNjk2MS'
df = pd.read_csv('drugs.tsv', sep='\t')

@app.route('/')
def index():
    if 'logged_in' not in session:
        return render_template('login.html')
    else:
        source = session.get('source', 'local')
        return render_template('index.html', source=source)

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
    data = request.json  # Accept JSON payload from React

    username = data.get('username')
    password = data.get('password')
    email = data.get('email')

    if not username or not password or not email:
        return jsonify({'error': 'All fields are required'}), 400

    try:
        conn = sqlite3.connect('backend/users.db')
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
        if cursor.fetchone():
            return jsonify({'error': 'Username already taken'}), 400

        cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
        if cursor.fetchone():
            return jsonify({'error': 'Email already registered'}), 400

        otp = generate_otp()
        send_email(email, "Welcome to PharmaGuard", otp)

        session['pending_user'] = {
            'username': username,
            'password': generate_password_hash(password),
            'email': email,
            'otp': otp
        }

        conn.close()
        return jsonify({'message': 'OTP sent to your email. Please verify.'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/verify_otp', methods=['POST'])
def verify_otp():
    data = request.json
    user_otp = data.get('otp')
    pending_user = session.get('pending_user')

    if not pending_user:
        return jsonify({'error': 'No pending registration found'}), 400

    if user_otp == pending_user['otp']:
        try:
            conn = sqlite3.connect('backend/users.db')
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO users (username, password, email) VALUES (?, ?, ?)",
                (pending_user['username'], pending_user['password'], pending_user['email'])
            )
            conn.commit()
            conn.close()

            session.pop('pending_user', None)
            return jsonify({'message': 'Registration successful!'}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    else:
        return jsonify({'error': 'Invalid OTP'}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5003)
