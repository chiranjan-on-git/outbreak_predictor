# app.py

from flask import Flask, jsonify
from flask_cors import CORS
from src.modeling.predictor import generate_global_forecast

# Initialize the Flask app
app = Flask(__name__)
# Enable CORS to allow your React app to make requests to this API
CORS(app)

# Cache the results so we don't re-run the model on every request
# In a real app, this would be a more sophisticated cache (like Redis)
# or the model would be run on a schedule.
print("Generating initial forecast... This may take a moment.")
GLOBAL_FORECAST_DATA = generate_global_forecast()
print("Forecast generated and cached.")

@app.route('/api/global-forecast', methods=['GET'])
def get_global_forecast():
    """
    API endpoint to get the global forecast data.
    """
    if GLOBAL_FORECAST_DATA is not None:
        # Convert DataFrame to a list of dictionaries (JSON friendly)
        json_output = GLOBAL_FORECAST_DATA.to_dict(orient='records')
        return jsonify(json_output)
    else:
        return jsonify({"error": "Failed to generate forecast"}), 500

# This allows running the app directly with 'python app.py'
if __name__ == '__main__':
    app.run(debug=True)