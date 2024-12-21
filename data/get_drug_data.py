import requests
import pandas as pd
import os

# API URL
url = 'https://api.fda.gov/drug/event.json?'

# API parameters
params = {
    'api_key': 'wDAtQe86UDtlfEkAjCS4uBBbvBZDCKAt8gNjk2MS',  # Replace with your actual API key
    'search': 'Aspirin',  # You can change this search term to fetch other data
    'limit': 2  # Increase limit to fetch more data per request
}

# Path to save the drugs data
drugs_file_path = 'drugs_list.csv'

# Check if the file already exists
if os.path.exists(drugs_file_path):
    # Load the existing CSV file
    drugs_df = pd.read_csv(drugs_file_path)
    print("Loaded existing drugs list.")
else:
    # Initialize an empty set to store unique drugs
    unique_drugs = set()

    # Fetch data until we reach 1000 unique drugs
    while len(unique_drugs) < 1000:
        # Sending GET request to fetch data
        response = requests.get(url, params=params)

        # Check if the request was successful
        if response.status_code == 200:
            data = response.json()  # Parse the response JSON
        else:
            print(f"Failed to retrieve data: {response.status_code}")
            break

        # Loop through results to fetch medicines for each patient
        for result in data.get('results', []):
            patient_data = result.get('patient', {})

            # Fetch the drug list (this contains the medicinal products)
            drugs = patient_data.get('drug', [])

            if drugs:
                for drug in drugs:
                    # Access medicinal product (medicine name)
                    medicinal_product = drug.get('medicinalproduct', 'No medicinal product available')

                    # Add the medicinal product to the set (ensures uniqueness)
                    unique_drugs.add(medicinal_product)

                    # Stop once we reach 1000 unique drugs
                    if len(unique_drugs) >= 1000:
                        break
            else:
                print("No drugs available for this patient")

        # Check if there are more pages to fetch
        if 'next' in data['meta']:
            # Update params with the next page link for pagination
            params['page'] = data['meta']['next']
        else:
            break  # Exit loop if no more pages are available

    # Convert the set of unique drugs into a DataFrame
    drugs_df = pd.DataFrame(list(unique_drugs), columns=['Medicinal Product'])

    # Remove the numbers in the format '/xxxxxx/'
    drugs_df['Medicinal Product'] = drugs_df['Medicinal Product'].replace(r'\/\d+\/', '', regex=True)

    # Save the dataframe to CSV
    drugs_df.to_csv(drugs_file_path, index=False)
    print("Fetched and saved new drugs list.")

# Display the DataFrame
print(drugs_df)
