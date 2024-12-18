from flask import Flask

app = Flask(__name__)

@app.route('/')
def index():
    return "Welcome to PharmaGuard!"

if __name__ == '__main__':
    app.run(debug=True, port=5003)  # Use a different port if necessary
