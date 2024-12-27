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

def generate_otp():
    return str(random.randint(100000, 999999)) 

def send_email(recipient_email, subject, body):
    sender_email = "yashsharma2845@gmail.com"  # Replace with your email
    sender_password = "sqazosdjaxrvsaiz"        # Replace with your email's app-specific password

    # Create the email message
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = sender_email
    msg["To"] = recipient_email

    # Send the email via an SMTP server
    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, [recipient_email], msg.as_string())
    except Exception as e:
        print(f"Error sending email: {e}")

# Disable Flask development server warnings
warnings.filterwarnings("ignore", category=UserWarning, module="werkzeug")

app = Flask(__name__, template_folder='../frontend/templates', static_folder='../frontend/static')

# Secret key for session management
app.secret_key = os.urandom(24)

# FDA API Key
FDA_API_KEY = 'wDAtQe86UDtlfEkAjCS4uBBbvBZDCKAt8gNjk2MS'

# Load the dataset from the TSV file (Stanford Drug Database)
df = pd.read_csv('drugs.tsv', sep='\t')

@app.route('/')
def index():
    if 'logged_in' not in session:
        return render_template('login.html')
    else:
        source = session.get('source', 'local')
        return render_template('index.html', source=source)  # After login, show drug search page

@app.route('/login', methods=['GET','POST'])
def login():
    if request.method == 'GET':
        # Just show the login form
        return render_template('login.html')

    # POST method: handle the submitted username/password
    username = request.form.get('username')
    password = request.form.get('password')

    import sqlite3
    from werkzeug.security import check_password_hash

    conn = sqlite3.connect('backend/users.db')
    cursor = conn.cursor()
    # Fetch the user by username
    cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
    user_record = cursor.fetchone()  # e.g., (id, username, hashed_pw)
    conn.close()

    if user_record is None:
        # User not found in the database
        return "Invalid credentials, please try again."

    # user_record[2] should be the hashed password from your table
    hashed_pw_in_db = user_record[2]  

    # Compare hashed password with the user’s submitted password
    if check_password_hash(hashed_pw_in_db, password):
        # Password correct—log the user in
        session['logged_in'] = True
        session['username'] = username
        return redirect(url_for('choose_resource'))
    else:
        # Password mismatch
        return "Invalid credentials, please try again."
    
@app.route('/guest_login', methods=['POST'])
def guest_login():
    # Log in as a guest
    session['logged_in'] = True
    session['username'] = "Guest"
    
    # Redirect to the main page or resource selection
    return redirect(url_for('choose_resource'))

@app.route('/check_username', methods=['GET'])
def check_username():
    username = request.args.get('username', '').strip()

    # Ensure a username is provided
    if not username:
        return jsonify({'available': False, 'suggestions': []})

    try:
        conn = sqlite3.connect('backend/users.db')
        cursor = conn.cursor()

        # Check if the username already exists
        cursor.execute("SELECT username FROM users WHERE username = ?", (username,))
        user = cursor.fetchone()
        conn.close()

        if user:
            suggestions = [
                f"{username}{random.randint(100, 999)}",
                f"{username}_{random.randint(10, 99)}",
                f"{username}{random.choice(['123', 'xyz', 'abc'])}"
            ]
            return jsonify({'available': False, 'suggestions': suggestions})
        else:
            # Username is available
            return jsonify({'available': True})
    except Exception as e:
        return jsonify({'available': False, 'suggestions': [], 'error': str(e)})


@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'GET':
        return render_template('register.html')
    else:
        username = request.form.get('username')
        password = request.form.get('password')
        email = request.form.get('email')

        try:
            conn = sqlite3.connect('backend/users.db')
            cursor = conn.cursor()

            # Check for duplicate username
            cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
            existing_username = cursor.fetchone()
            if existing_username:
                # Generate suggestions for usernames
                suggestions = []
                for i in range(1, 4):  # Generate 3 suggestions
                    suggested_username = f"{username}_{random.randint(100, 999)}"
                    cursor.execute("SELECT * FROM users WHERE username = ?", (suggested_username,))
                    if not cursor.fetchone():
                        suggestions.append(suggested_username)

                conn.close()
                suggestions_html = ", ".join([f"<b>{s}</b>" for s in suggestions])
                return f"The username is already taken. Please choose another one. Suggestions: {suggestions_html}"

            # Check for duplicate email
            cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
            existing_email = cursor.fetchone()
            conn.close()
            if existing_email:
                return "An account with this email already exists. Please <a href='/'>log in</a>."

        except Exception as e:
            return f"An error occurred while checking the database: {e}"

        # If both username and email are unique, proceed with OTP generation and registration
        otp = str(random.randint(100000, 999999))

        # Send the OTP via email
        subject = "Your PharmaGuard OTP"
        body = f"Your OTP for PharmaGuard is {otp}. Please enter it to complete your registration."
        send_email(email, subject, body)

        # Store the OTP and temporary registration data in the session
        session['otp'] = otp
        session['temp_username'] = username
        session['temp_password'] = generate_password_hash(password)
        session['temp_email'] = email

        return render_template('verify_otp.html')  # Redirect to OTP verification page



    
@app.route('/verify_otp', methods=['GET', 'POST'])
def verify_otp():
    if request.method == 'GET':
        return render_template('verify_otp.html')
    else:
        user_otp = request.form.get('otp')  # Get OTP entered by the user
        pending_user = session.get('pending_user')  # Retrieve pending user details from session

        if not pending_user:
            return "No pending registration found. Please register again."

        # Validate OTP
        if user_otp == pending_user['otp']:
            # OTP is correct; save the user to the database
            try:
                conn = sqlite3.connect('backend/users.db')
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO users (username, password, email)
                    VALUES (?, ?, ?)
                """, (pending_user['username'], pending_user['password'], pending_user['email']))
                conn.commit()
                conn.close()

                # Clear the session after successful registration
                session.pop('pending_user', None)
                return "Registration successful! You can now <a href='/'>log in</a>."
            except Exception as e:
                return f"An error occurred: {e}"
        else:
            # OTP is incorrect
            return "Invalid OTP. Please try again."


@app.route('/choose_resource', methods=['GET', 'POST'])
def choose_resource():
    if 'logged_in' in session:
        if request.method == 'POST':  # Handle form submission to choose resource
            source = request.form.get('source')  # Get the selected resource
            session['source'] = source  # Store the source in session
            return redirect(url_for('index'))  # Redirect to the search page after resource selection

        return render_template('choose_resource.html')  # If GET, show resource choice page
    return redirect(url_for('index'))  # Redirect to login if not logged in

@app.route('/logout', methods=['POST'])
def logout():
    # Clear all session data
    session.clear()  # This clears everything in the session
    return redirect(url_for('index'))  # Redirect to login page after logging out

@app.route('/drug_interactions', methods=['GET'])
def get_drug_interactions():
    drug_name = request.args.get('drug_name')
    source = session.get('source', 'local')  # Use session to get the resource source (default to 'local')

    if not drug_name:
        return jsonify({"error": "Please provide a drug name."}), 400

    # Local database search (Stanford Drug Database)
    if source == 'local':
        interactions = df[(df['drug1'].str.contains(drug_name, case=False)) | 
                          (df['drug2'].str.contains(drug_name, case=False))]

        if interactions.empty:
            return jsonify({"message": f"No interactions found for {drug_name}."}), 404

        # Include the proportional_reporting_ratio in the result
        result = interactions[['drug1', 'drug2', 'event_name', 'proportional_reporting_ratio']].to_dict(orient='records')
        return jsonify({"drug_interactions": result})

    # Fetching data from FDA API
    elif source == 'fda':
        api_url = f'https://api.fda.gov/drug/label.json?search=drug_interactions:"{drug_name}"'
        headers = {'Authorization': f'Bearer {FDA_API_KEY}'}  # Include the FDA API key in the header

        try:
            response = requests.get(api_url, headers=headers)
            if response.status_code == 200:
                data = response.json()
                if 'results' in data:
                    interactions = data['results']
                    result = [{
                        'drug1': drug_name,
                        'drug2': interaction.get('drug_name', 'N/A'),
                        'event_name': interaction.get('interaction', 'No description available')
                    } for interaction in interactions]

                    return jsonify({"drug_interactions": result})
                else:
                    return jsonify({"message": f"No interactions found for {drug_name}."}), 404
            else:
                return jsonify({"error": "Error fetching data from FDA API."}), 500
        except Exception as e:
            return jsonify({"error": f"An error occurred: {str(e)}"}), 500

    else:
        return jsonify({"error": "Invalid source selected."}), 400
    

@app.route('/check_email', methods=['GET'])
def check_email():
    email = request.args.get('email')
    if not email:
        return jsonify({'error': 'Email is required'}), 400

    try:
        conn = sqlite3.connect('backend/users.db')
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
        user = cursor.fetchone()
        conn.close()

        if user:
            return jsonify({'exists': True})
        else:
            return jsonify({'exists': False})
    except Exception as e:
        return jsonify({'error': str(e)}), 500




if __name__ == '__main__':
    app.run(debug=True, port=5003)