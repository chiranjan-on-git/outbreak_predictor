# src/modeling/predictor.py

import pandas as pd
import numpy as np
import xgboost as xgb
import os

def generate_global_forecast():
    """
    Loads data, trains the model on all historical data,
    and generates a forecast with risk scores for the next year.
    Returns a DataFrame with the results.
    """
    # --- 1. Load and Prepare Data ---
    # Note the relative path to find the data from where the app will run
    processed_data_path = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'processed', 'measles_cases_processed_timeseries.csv')
    df_cases = pd.read_csv(processed_data_path, index_col='Year', parse_dates=True)

    df_long = df_cases.melt(ignore_index=False, var_name='CountryCode', value_name='Cases').reset_index()
    df_long.sort_values(by=['CountryCode', 'Year'], inplace=True)
    df_long['Cases_Next_Year'] = df_long.groupby('CountryCode')['Cases'].shift(-1)
    df_long['Cases_Lag_1'] = df_long.groupby('CountryCode')['Cases'].shift(1)
    df_long['Year_Num'] = df_long['Year'].dt.year
    df_final = df_long.dropna(subset=['Cases_Next_Year', 'Cases_Lag_1'])

    # --- 2. Train Model on All Data ---
    features = ['Cases', 'Cases_Lag_1', 'Year_Num']
    target = 'Cases_Next_Year'
    X_full = df_final[features]
    y_full = df_final[target]
    model_full = xgb.XGBRegressor(objective='reg:squarederror', n_estimators=500, learning_rate=0.05)
    model_full.fit(X_full, y_full, verbose=False)

    # --- 3. Prepare Data for Future Prediction ---
    most_recent_year_data = df_long[df_long['Year'] == df_long['Year'].max()].copy()
    if 'Cases_Lag_1' in most_recent_year_data.columns:
        most_recent_year_data.drop(columns=['Cases_Lag_1'], inplace=True)
    prev_year = df_long['Year'].max() - pd.DateOffset(years=1)
    prev_year_cases = df_long[df_long['Year'] == prev_year][['CountryCode', 'Cases']]
    most_recent_year_data = pd.merge(most_recent_year_data, prev_year_cases.rename(columns={'Cases': 'Cases_Lag_1'}), on='CountryCode', how='left')
    X_predict = most_recent_year_data[features].dropna()

    # --- 4. Generate Forecast ---
    future_forecasts = model_full.predict(X_predict)
    forecast_df = X_predict.copy()
    forecast_df['Forecasted_Cases'] = np.maximum(0, future_forecasts)
    forecast_df = pd.merge(forecast_df, most_recent_year_data[['CountryCode']], left_index=True, right_index=True, how='left')

    # --- 5. Risk Scoring ---
    end_year = df_cases.index.max().year
    start_year = end_year - 10
    historical_stats = df_cases.loc[str(start_year):str(end_year)].agg(['mean', 'std']).transpose()
    historical_stats.rename(columns={'mean': 'Mean_Cases_10Y', 'std': 'Std_Cases_10Y'}, inplace=True)
    historical_stats.fillna(0, inplace=True)
    results_df = pd.merge(forecast_df, historical_stats, left_on='CountryCode', right_index=True)

    def assign_risk_level(row):
        mean, std, forecast = row['Mean_Cases_10Y'], row['Std_Cases_10Y'], row['Forecasted_Cases']
        if std == 0: return 'High' if forecast > mean else 'Low'
        if forecast > mean + (2 * std): return 'High'
        elif forecast > mean + std: return 'Medium'
        else: return 'Low'
    
    results_df['Risk_Level'] = results_df.apply(assign_risk_level, axis=1)
    
    return results_df