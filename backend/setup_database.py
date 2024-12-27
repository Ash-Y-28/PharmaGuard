import sqlite3

# 1. Connect to (or create) the database file named "users.db".
#    This file will appear in the same directory as setup_database.py if it doesn't exist already.
conn = sqlite3.connect('backend/users.db', timeout=10)

# 2. Create a cursor to run SQL commands.
cursor = conn.cursor()

# 3. Execute a CREATE TABLE statement for a "users" table.
#    - id: an automatically incrementing integer (the primary key).
#    - username: text type, must be unique.
#    - password: text type, which will eventually hold the hashed password.
cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )
''')

# 4. Save (commit) the changes.
conn.commit()

# 5. Close the connection to the database so we don’t lock the file.
conn.close()

print("Database setup complete! A 'users.db' file with a 'users' table has been created/updated.")
