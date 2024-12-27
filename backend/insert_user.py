import sqlite3
from werkzeug.security import generate_password_hash

# Connect to the same 'users.db'
conn = sqlite3.connect('backend/users.db')
cursor = conn.cursor()

# We'll insert a user with a hashed password
username = "hashed_user"
raw_password = "mysecret"

# Generate a salted hash of the raw password
hashed_pw = generate_password_hash(raw_password)

try:
    cursor.execute("""
        INSERT INTO users (username, password)
        VALUES (?, ?)
    """, (username, hashed_pw))
    conn.commit()
    print(f"User '{username}' inserted successfully with hashed password!")
except sqlite3.IntegrityError:
    print(f"Could not insert user '{username}' (username might already exist).")

conn.close()
