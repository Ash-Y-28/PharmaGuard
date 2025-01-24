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
import os
import openai
import json
from dotenv import load_dotenv

load_dotenv()


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

app.config['SECRET_KEY'] = os.getenv("SECRET_KEY")



CORS(app)

@app.route('/')
def index():
    return "Welcome to the new homepage!"

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
    SECRET_KEY = os.getenv("SECRET_KEY")
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
            {'username': username, 'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=1)},
            app.config['SECRET_KEY'],
            algorithm="HS256"
        )

        return jsonify({'message': 'Login successful', 'token': token, 'username': username}), 200
    except Exception as e:
        print("Error in /login:", str(e))
        return jsonify({'error': 'Failed to login'}), 500

@app.route('/guest_login', methods=['POST'])
def guest_login():
    try:
        print("SECRET_KEY:", app.config['SECRET_KEY'])  # Debugging the key
        print("Username: guest")  # Debugging the payload
        # Generate a guest token
        token = jwt.encode(
            {'username': 'guest', 'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=1)},
            app.config['SECRET_KEY'],
            algorithm="HS256"
        )

        return jsonify({'message': 'Guest login successful', 'token': token}), 200
    except Exception as e:
        print("Error in /guest_login:", str(e))
        return jsonify({'error': 'Failed to login as guest'}), 500
    
import re


openai.API_KEY = os.getenv("OPENAI_API_KEY").strip()

openai.api_key = openai.API_KEY

@app.route('/drug_interactions', methods=['GET'])
def drug_interactions():
    
    # 1) Retrieve drug1 and drug2 from query parameters
    drug1 = request.args.get('drug1', '').strip()
    drug2 = request.args.get('drug2', '').strip()

    # 2) Validate inputs
    if not drug1 or not drug2:
        return jsonify({'error': 'Both "drug1" and "drug2" are required'}), 400

    try:
        # Connect to SQLite database
        conn = sqlite3.connect('./backend/drugs.db')
        cursor = conn.cursor()

        # Query database for interactions
        query = """
        SELECT drug1, drug2, event_name, proportional_reporting_ratio
        FROM drugs
        WHERE (drug1 = ? AND drug2 = ?) OR (drug1 = ? AND drug2 = ?)
        """
        cursor.execute(query, (drug1, drug2, drug2, drug1))
        interactions = cursor.fetchall()
        conn.close()

        # -----------------------------------------------
        # Fallback AI logic if no local data is found
        # -----------------------------------------------
        if not interactions:
            # Instead of just returning "No interactions found," call OpenAI
            prompt_text = f"""
            I have two drugs: {drug1} and {drug2}.

            First, validate if both are actual drug names. 

            If you dont find either of the drug names valid you dont have to provide any response or events whatsoever.

            Please discuss any potential interactions, side effects, or warnings 
            that may occur when these two drugs are taken together.


            Then categorize each significant interaction or adverse event you mention 
            into one of these categories there should atleast be eight events: 'Most Likely'.

            Finally, provide only a JSON response with the following format but do not state it anywhere saying anything like 'Here is the JSON response':
            {{
              "most_likely": ["event1", "event2", "event3", "event4", "event5"]
            }}

            """

            try:
                response = openai.chat.completions.create(
                    model="gpt-4",
                    messages=[
                        {
                            "role": "system",
                            "content": "You are a medical expert. Use disclaimers if needed."
                        },
                        {
                            "role": "user",
                            "content": prompt_text
                        }
                    ],
                    max_tokens=1000,
                    temperature=0.7
                )

                content = response.choices[0].message.content

                # Remove any lines containing the word "JSON"
                cleaned_content = "\n".join(
                    [line for line in content.splitlines() if "JSON" not in line]
                    ).strip()

                # Debug: Print raw AI response
                print("Raw AI Response:", content)

                # Attempt to extract JSON using regex
                json_match = re.search(r'{.*}', cleaned_content, re.DOTALL)
                if json_match:
                    # Extract JSON
                    json_data = json.loads(json_match.group(0))
                    # Extract text before JSON
                    text_summary = cleaned_content[:json_match.start()].strip()
                else:
                    raise ValueError("No JSON found in the response.")

                # Debug: Print extracted components
                print("Text Summary:", text_summary)
                print("JSON Data:", json_data)

                # Return AI-based data with text summary and a disclaimer
                return jsonify({
                    'ai_fallback': True,
                    'text_summary': text_summary,
                    'data': json_data,
                    'disclaimer': 'This is generated by an AI model, not guaranteed. Use caution.'
                }), 200

            except json.JSONDecodeError as e:
                print("JSON Decode Error:", e)
                return jsonify({
                    'ai_fallback': True,
                    'message': 'AI provided an invalid JSON response.',
                    'raw_response': content
                }), 200

            except Exception as e:
                print("Error calling OpenAI:", e)
                return jsonify({
                    'message': f'No interactions found for "{drug1}" and "{drug2}"'
                }), 200
        # -----------------------------------------------
        # End AI fallback section
        # -----------------------------------------------

        # 5) Prepare data structures for categorizing
        categorized = {
            'unlikely': {},
            'likely': {},
            'most_likely': {}
        }

        # 6) Iterate through matching rows, categorize by PRR and severity
        def assign_severity(prr):
            """
            Assign severity level based on PRR and p-value.
            """
            if prr > 50:
                return "high"
            elif prr > 20:
                return "medium"
            else:
                return "low"

        for row in interactions:
            drug1, drug2, event_name, prr = row  # Unpack tuple directly
            prr = float(prr)  # Convert PRR to float
            drug_combination = f"{drug1} + {drug2}"  # Combine drug names
            event = event_name  # Get event name

            # Determine severity
            severity = assign_severity(prr)

            # Categorize based on PRR (existing logic)
            if prr < 5:
                category = 'unlikely'
            elif 5 <= prr < 15:
                category = 'likely'
            else:
                category = 'most_likely'

            if drug_combination not in categorized[category]:
                categorized[category][drug_combination] = {
                    'events': [],
                    'severity': severity
                }

            categorized[category][drug_combination]['events'].append(event)

        # 7) Convert event lists to comma-separated strings
        for category in categorized:
            for combo in categorized[category]:
                events_list = categorized[category][combo]['events']
                categorized[category][combo]['events'] = ', '.join(events_list)

        return jsonify(categorized), 200

    except Exception as e:
        print("Error processing drug interactions:", e)
        return jsonify({'error': 'Failed to process drug interactions'}), 500



@app.route('/fda_interactions', methods=['GET'])
def fda_interactions():
    drug_name = request.args.get('drug_name', '').strip()

    if not drug_name:
        return jsonify({'error': 'Drug name is required'}), 400

    try:
        FDA_API_KEY = 'wDAtQe86UDtlfEkAjCS4uBBbvBZDCKAt8gNjk2MS'
        api_url = f'https://api.fda.gov/drug/label.json?search=openfda.generic_name:"{drug_name}"'
        headers = {'Authorization': f'Bearer {FDA_API_KEY}'}

        response = requests.get(api_url, headers=headers)
        response_data = response.json()

        if 'results' in response_data:
            # Extract relevant information
            interactions = [
                {
                    'description': res.get('description', 'No description available'),
                    'active_ingredient': res.get('active_ingredient', 'No active ingredient available'),
                    'drug_interactions': res.get('drug_interactions', 'No interactions available'),
                    'warnings_and_cautions': res.get('warnings_and_cautions', 'No warnings available'),
                    'boxed_warning': res.get('boxed_warning', 'No warnings available'),
                    'indications_and_usage': res.get('indications_and_usage', 'No indications and usage information available'),
                    'purpose': res.get('purpose', 'Purpose of the drug not available'),
                    'dosage_and_administration': res.get('dosage_and_administration', 'No dosage information available for this drug'),
                    'contraindications': res.get('contraindications', 'No contraindications of this drug available'),
                    'information_for_patients': res.get('information_for_patients', 'No information for the patients available'),
                    'ask_doctor_or_pharmacist': res.get('ask_doctor_or_pharmacist', 'No information available'),
                    'do_not_use': res.get('do_not_use', 'No information available'),
                    'instructions_for_use': res.get('instructions_for_use', 'No instructions for use available'),
                    'mechanism_of_action': res.get('mechanism_of_actio', 'No mechanism available for this drug'),
                    'pregnancy': res.get('pregnancy', 'No information available')
                }
                for res in response_data['results']
            ]
            return jsonify(interactions), 200
        else:
            return jsonify({'message': f'No interactions found for {drug_name}'}), 200
    except Exception as e:
        print("Error fetching FDA data:", e)
        return jsonify({'error': 'Failed to fetch FDA interactions'}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5003)