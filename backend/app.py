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
    else:
        return render_template('index.html')  # After login, show drug search page

@app.route('/login', methods=['GET','POST'])
def login():
    username = request.form.get('username')
    password = request.form.get('password')

    if username == 'admin' and password == '12345':
        session['logged_in'] = True
        return redirect(url_for('choose_resource'))  # Redirect to choose resource page
    else:
        return 'Invalid credentials, please try again.'

@app.route('/choose_resource', methods=['GET', 'POST'])
def choose_resource():
    if 'logged_in' in session:
        if request.method == 'POST':  # Handle form submission to choose resource
            source = request.form.get('source')  # Get the selected resource
            session['source'] = source  # Store the source in session
            return redirect(url_for('index'))  # Redirect to the search page after resource selection

        return render_template('choose_resource.html')  # If GET, show resource choice page
    return redirect(url_for('index'))  # Redirect to login if not logged in

@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    return redirect(url_for('index'))  # Redirect to login page after logging out

# Load the dataset from the TSV file
df = pd.read_csv('drugs.tsv', sep='\t')

@app.route('/drug_interactions', methods=['GET'])
def get_drug_interactions():
    drug_name = request.args.get('drug_name')
    source = session.get('source', 'local')  # Use session to get the resource source (default to 'local')

    if not drug_name:
        return jsonify({"error": "Please provide a drug name."}), 400

    # Local database search
    if source == 'local':
        interactions = df[(df['drug1'].str.contains(drug_name, case=False)) | 
                          (df['drug2'].str.contains(drug_name, case=False))]

    if interactions.empty:
        return jsonify({"message": f"No interactions found for {drug_name}."}), 404

    result = interactions[['drug1', 'drug2', 'event_name']].to_dict(orient='records')
    return jsonify({"drug_interactions": result})

if __name__ == '__main__':
    app.run(debug=True, port=5003)
