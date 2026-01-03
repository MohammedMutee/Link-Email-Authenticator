
import pandas as pd
import numpy as np
import os
import re
from sklearn.ensemble import RandomForestClassifier

# Define the extraction function exactly as in ml_engine.py
def extract_url_features(url):
    length = len(url)
    num_dots = url.count('.')
    has_at_symbol = 1 if '@' in url else 0
    is_https = 1 if 'https' in url else 0
    has_ip_address = 1 if re.search(r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', url) else 0
    num_hyphens = url.count('-')
    num_digits = sum(c.isdigit() for c in url)
    has_double_slash = 1 if url.count('//') > 1 else 0
    return [length, num_dots, has_at_symbol, is_https, has_ip_address, num_hyphens, num_digits, has_double_slash]

try:
    print("--- DEBUGGING URL DATASET ---")
    url_csv_path = 'datasets/Phishing_URL_Dataset.csv'
    if os.path.exists(url_csv_path):
        df = pd.read_csv(url_csv_path, usecols=['URL', 'label'])
        print(f"Total Rows: {len(df)}")
        print(f"Label Distribution:\n{df['label'].value_counts()}")
        
        # Check a sample of phishing vs safe URLs
        print("\nSample Phishing URLs (label=1):")
        print(df[df['label'] == 1]['URL'].head(3))
        
        print("\nSample Safe URLs (label=0):")
        print(df[df['label'] == 0]['URL'].head(3))
        
        # Train on a small sample
        df_sample = df.sample(n=5000, random_state=42)
        X = [extract_url_features(str(u)) for u in df_sample['URL']]
        y = df_sample['label']
        
        clf = RandomForestClassifier(n_estimators=10, random_state=42)
        clf.fit(X, y)
        print("\nTraining complete on sample.")
        
        # Test Predictions
        test_cases = [
            "https://google.com", 
            "http://192.168.0.1/login", 
            "http://secure-bank-login-update-account.com",
            "asdfghjkl"
        ]
        
        print("\n--- PREDICTION TEST ---")
        for t in test_cases:
            feats = extract_url_features(t)
            prob = clf.predict_proba([feats])[0][1]
            print(f"URL: {t}")
            print(f"Features: {feats}")
            print(f"Risk Score: {int(prob * 100)}%")
            print("-" * 20)
            
    else:
        print(f"File not found: {url_csv_path}")

except Exception as e:
    print(f"Error: {e}")
