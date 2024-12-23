import warnings
from werkzeug.exceptions import HTTPException
from flask import Flask, jsonify, request, render_template, redirect, url_for, session
import pandas as pd
import os

# Disable Flask development server warnings
warnings.filterwarnings("ignore", category=UserWarning, module="werkzeug")

app = Flask(__name__, template_folder='../frontend/templates', static_folder='../frontend/static')

# Secret key for session management
app.secret_key = os.urandom(24)

@app.route('/')
def index():
    if 'logged_in' not in session:
        return render_template('login.html')
    else:  # If not logged in, show the login page
        return redirect(url_for('choose_resource'))  # Redirect to choose_resource if logged in

@app.route('/login', methods=['GET','POST'])
def login():
    
    username = request.form.get('username')
    password = request.form.get('password')
    
    # Here, we can check the credentials (for now, assuming success)
    if username == 'admin' and password == '12345':
        session['logged_in'] = True  # Mark user as logged in
        print("Session set to:", session.get('logged_in'))
        return redirect(url_for('choose_resource'))  # Redirect to resource choice
    else:
        return 'Invalid credentials, please try again.'

@app.route('/choose_resource')
def choose_resource():
    if 'logged_in' in session:  # Check if user is logged in
        return render_template('choose_resource.html')  # Show the resource choice page
    return redirect(url_for('index'))  # Redirect to login if not logged in

@app.route('/logout')
def logout():
    # Clear the session and log the user out
    session.pop('logged_in', None)
    return redirect(url_for('index'))  # Redirect to login page after logging out

# Load the dataset from the TSV file
df = pd.read_csv('drugs.tsv', sep='\t')  # Modify the file path if needed

@app.route('/drug_interactions', methods=['GET'])
def get_drug_interactions():
    # Get the drug name from the query parameters
    drug_name = request.args.get('drug_name')

    # Check if drug_name is provided
    if not drug_name:
        return jsonify({"error": "Please provide a drug name."}), 400

    # Local database search
    interactions = df[(df['drug1'].str.contains(drug_name, case=False)) | 
                      (df['drug2'].str.contains(drug_name, case=False))]

    # If no interactions found, return a message
    if interactions.empty:
        return jsonify({"message": f"No interactions found for {drug_name}."}), 404

    # Format the data to return as JSON
    result = interactions[['drug1', 'drug2', 'event_name']].to_dict(orient='records')
    
    # Return the interactions as a JSON response
    return jsonify({"drug_interactions": result})

if __name__ == '__main__':
    app.run(debug=True, port=5003)  # Run on port 5003, or use any other available port
