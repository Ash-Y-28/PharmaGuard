import requests
import pandas as pd

# Function to fetch data from the FDA API
def fetch_drug_data(drug_name):
    url = f'https://api.fda.gov/drug/Label.json?search=drug_interactions:{drug_name}&limit=1'
    
    # Send GET request to the FDA API
    response = requests.get(url)
    
    # Check if the request was successful
    if response.status_code == 200:
        data = response.json()
        
        # Extract the DESCRIPTION and DRUG_INTERACTIONS sections
        description = None
        drug_interactions = None
        
        if 'results' in data:
            for result in data['results']:
                # Extract DESCRIPTION
                if 'description' in result:
                    description = result['description']
                
                # Extract DRUG_INTERACTIONS
                if 'drug_interactions' in result:
                    drug_interactions = result['drug_interactions']
        
        # Return a dictionary with only the required fields
        return {
            'Description': description,
            'Drug Interactions': drug_interactions
        }
    else:
        print(f"Failed to fetch data for {drug_name}: {response.status_code}")
        return None

# Initialize an empty list to store the results
results = []

# List of drugs you want to process (this can be obtained dynamically from your CSV file)
drug_list = [
    "ranitidine",
    "d",
    "hydrocortisone",
    "omega",
    "axid",
    "vasogard",
    "plendil",
    "lexapro",
    "atorvastatin"
]  # Replace with the dynamic list

# Fetch data for each drug in the list
for drug in drug_list:
    drug_data = fetch_drug_data(drug)
    if drug_data:
        # Modify DESCRIPTION to extract only the drug name
        description = drug_data['Description']
        if description:
            if isinstance(description, list):
                description = description[0]
            
            # Split the description to remove everything after DESCRIPTION
            description = description.split('DESCRIPTION', 1)[1].strip()

            # Now, split at the first comma or "and" to clean up the description
            if ',' in description:
                description = description.split(',', 1)[0].strip()  # Remove everything after the first comma
            elif 'and' in description:
                description_parts = description.split('and', 1)
                description = f"{description_parts[0].strip()} and {description_parts[1].strip()}"
            else:
                description = description.strip()  # No comma or "and", keep as is

            # Clean up the description to remove any extra text like '...'
            description = description.split('...')[0].strip()

        # Update the description with the cleaned text
        drug_data['Description'] = description
        
        # Append the cleaned data to the results
        results.append(drug_data)

# Convert the results into a DataFrame for easy viewing
df = pd.DataFrame(results)

# Display the DataFrame
print(df)
