import warnings
from werkzeug.exceptions import HTTPException

# Disable Flask development server warnings
warnings.filterwarnings("ignore", category=UserWarning, module="werkzeug")

from flask import Flask, jsonify, request, render_template
import pandas as pd
import os

app = Flask(__name__, template_folder='../frontend/templates', static_folder='../frontend/static')

@app.route('/')
def index():
    return render_template('index.html')  # This will render the index.html file


# Load the dataset from the TSV file
df = pd.read_csv('drugs.tsv', sep='\t')  # Modify the file path if needed

# Create an API endpoint to fetch drug interactions
@app.route('/drug_interactions', methods=['GET'])
def get_drug_interactions():
    # Get the drug name from the query parameters
    drug_name = request.args.get('drug_name')

    # Check if drug_name is provided
    if not drug_name:
        return jsonify({"error": "Please provide a drug name."}), 400
    
    # Filter the dataset for interactions with the provided drug name
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
