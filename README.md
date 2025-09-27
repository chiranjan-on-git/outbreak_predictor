# Regional Disease Outbreak Predictor

An end-to-end data science application that forecasts disease outbreaks based on historical data from the World Health Organization (WHO). The project transforms raw time-series data into actionable insights, presented in a clean, interactive web dashboard.


*(Feel free to replace this placeholder image with a screenshot of your own dashboard!)*

## Features

-   **Machine Learning Model**: Utilizes an XGBoost model to forecast future disease cases for the next year.
-   **Dynamic Risk Scoring**: Converts raw forecasts into intuitive risk levels (Low, Medium, High) based on each country's historical volatility.
-   **Interactive Frontend**: A fast, responsive dashboard built with vanilla HTML, CSS, and JavaScript—no heavy frameworks.
-   **Rich Visualizations**:
    -   **Global Outbreak Radar**: A pie chart showing the worldwide distribution of risk levels.
    -   **Top High-Risk Countries**: A bar chart highlighting countries with the most significant predicted outbreaks.
    -   **Forecast vs. History**: A comparative bar chart to contextualize the forecast against the 10-year average.
    -   **Regional Risk Distribution**: A stacked bar chart breaking down risk levels by geographical region.
-   **Data Explorer**: A sortable and scrollable table for inspecting the full forecast data.
-   **Dark/Light Mode**: A theme toggle with user preference saved in local storage.

## Tech Stack

This project is a full-stack application composed of a Python backend and a JavaScript frontend.

| Component             | Technologies Used                                             |
| --------------------- | ------------------------------------------------------------- |
| **Backend & Data Science** | Python, Flask, Pandas, Scikit-learn, XGBoost, Jupyter Notebooks |
| **Frontend**          | HTML5, CSS3, Vanilla JavaScript, Chart.js                     |

## Project Architecture

The application follows a classic client-server model:

1.  **Python Backend (Server)**:
    -   A Flask web server exposes a single REST API endpoint (`/api/global-forecast`).
    -   On startup, the server loads historical measles data, engineers features (e.g., lags, rolling averages), and trains an XGBoost regression model.
    -   It then generates a forecast for the next year, calculates risk scores, and caches the final JSON data.

2.  **JavaScript Frontend (Client)**:
    -   A static web page that runs entirely in the browser.
    -   On page load, it sends a request to the backend API to fetch the forecast data.
    -   Once the data is received, it uses the Chart.js library to render the interactive visualizations and populate the data table.

## Data Science Workflow

The predictive core of this project follows a structured data science pipeline:

1.  **Data Collection**: Fetches annual reported Measles case counts from the WHO Global Health Observatory.
2.  **Data Preprocessing**: Cleans the data, handles missing values, and pivots the dataset into a time-series format suitable for analysis.
3.  **Feature Engineering**: Creates predictive features, including lagged case counts (cases from 1, 2, and 3 years prior) and rolling averages to capture recent trends.
4.  **Modeling**: An XGBoost model is trained on the engineered features to predict the case count for the following year.
5.  **Risk Scoring**: A statistical method is applied to the model's output, classifying each country's forecast as "High," "Medium," or "Low" risk by comparing it to the mean and standard deviation of its last 10 years of data.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

-   Python 3.8+
-   Git
-   VS Code with the **Live Server** extension

### Installation & Setup

#### 1. Backend Server

First, set up and run the Python Flask API.

```bash
# Clone the repository
git clone https://github.com/your-username/outbreak_predictor.git
cd outbreak_predictor

# Create and activate a virtual environment
# On macOS/Linux:
python3 -m venv venv
source venv/bin/activate
# On Windows:
python -m venv venv
.\venv\Scripts\activate

# Install the required packages
pip install -r requirements.txt

# Run the Flask application
python app.py
```

Your backend server is now running at `http://127.0.0.1:5000`.

#### 2. Frontend Dashboard

Next, launch the frontend using the Live Server extension.

1.  Open the `outbreak-dashboard-vanilla` folder in a new VS Code window.
2.  Right-click on the `index.html` file.
3.  Select "Open with Live Server".

A new browser tab will open at an address like `http://127.0.0.1:5500`, and you should see the dashboard load its data from the backend.

## Future Enhancements

This project has a solid foundation that can be extended with many exciting features:

-   **GeoJSON Map**: Integrate a world map (using Leaflet or Mapbox) to visualize outbreak risks geographically.
-   **More Data Sources**: Enrich the model with climate data (temperature, rainfall), public health advisories, or population density.
-   **Advanced Models**: Experiment with time-series models like SARIMA or deep learning models like LSTMs.
-   **Model Management**: Serve the pre-trained model using MLflow to make the API faster and more production-ready.
