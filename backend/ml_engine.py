import pandas as pd
import numpy as np
import pickle
import re
import os
from sklearn.ensemble import RandomForestClassifier
from sklearn.naive_bayes import MultinomialNB
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split

from urllib.parse import urlparse

class URLAnalyzer:
    def __init__(self):
        self.model = None
        self.whitelist = [
            'outlook.office.com', 'office.com', 'microsoft.com', 
            'google.com', 'gmail.com', 'docs.google.com',
            'drive.google.com', 'github.com', 'linkedin.com',
            'amazon.com', 'apple.com', 'dropbox.com'
        ]

    def _extract_features(self, url):
        """
        Extracts features from the URL: [len, dots, @, https, ip, hyphens, digits, double_slash]
        """
        length = len(url)
        num_dots = url.count('.')
        has_at_symbol = 1 if '@' in url else 0
        is_https = 1 if 'https' in url else 0
        has_ip_address = 1 if re.search(r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', url) else 0
        num_hyphens = url.count('-')
        num_digits = sum(c.isdigit() for c in url)
        has_double_slash = 1 if url.count('//') > 1 else 0
        return [length, num_dots, has_at_symbol, is_https, has_ip_address, num_hyphens, num_digits, has_double_slash]

    def _check_whitelist(self, url):
        try:
            parsed = urlparse(url)
            hostname = parsed.netloc.lower()
            if not hostname: # Handle cases like 'google.com' without http scheme where netloc might be empty or in path
                if '/' in url:
                    hostname = url.split('/')[0]
                else:
                    hostname = url

            # Remove port if present
            if ':' in hostname:
                hostname = hostname.split(':')[0]

            for domain in self.whitelist:
                # Strict check: Hostname IS the domain OR Hostname ENDS WITH .domain
                if hostname == domain or hostname.endswith('.' + domain):
                    return True, domain
            return False, None
        except:
            return False, None

    def _explain(self, url):
        reasons = []
        heuristic_score = 0
        
        # Check Whitelist First
        is_whitelisted, domain = self._check_whitelist(url)
        if is_whitelisted:
            return ["Verified Safe Domain (Whitelisted: " + domain + ")."], 0
        
        if len(url) > 75:
            reasons.append("Suspicious: Unusual URL length (>75 chars).")
            heuristic_score += 20
            
        if re.search(r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', url):
            reasons.append("High Risk: Raw IP address detected.")
            heuristic_score += 60
            
        if '@' in url:
            reasons.append("High Risk: '@' symbol used to obscure target.")
            heuristic_score += 50
            
        if url.count('-') > 3:
             reasons.append(f"Suspicious: High number of hyphens ({url.count('-')}).")
             heuristic_score += 15
             
        num_digits = sum(c.isdigit() for c in url)
        if num_digits > 10:
            reasons.append(f"Suspicious: High digit count ({num_digits}) - possible obfuscation.")
            heuristic_score += 20
            
        keywords = ['login', 'secure', 'account', 'update', 'verify', 'bank', 'password', 'confirm', 'signin']
        found_keywords = [word for word in keywords if word in url.lower()]
        if found_keywords:
            reasons.append(f"Suspicious: Sensitive keyword context: {', '.join(found_keywords)}.")
            heuristic_score += 50 # Increased to ensure >49% Suspicious threshold
            
        if url.count('//') > 1:
            reasons.append("High Risk: Open redirect pattern (//) detected.")
            heuristic_score += 60 # Increased to exceed Safe threshold (50)
            
        return reasons, heuristic_score

    def train(self):
        print("[URLAnalyzer] Initializing training...")
        try:
            csv_path = os.path.join(os.path.dirname(__file__), '../datasets/Phishing_URL_Dataset.csv')
            if os.path.exists(csv_path):
                print(f"[URLAnalyzer] Loading dataset form {csv_path}...")
                df = pd.read_csv(csv_path, usecols=['URL', 'label'])
                df = df.sample(n=min(10000, len(df)), random_state=42)
                
                X = [self._extract_features(str(u)) for u in df['URL']]
                y = df['label']
                
                self.model = RandomForestClassifier(n_estimators=50, random_state=42)
                self.model.fit(X, y)
                print("[URLAnalyzer] Model trained successfully.")
            else:
                self._train_dummy()
        except Exception as e:
            print(f"[URLAnalyzer] Training failed: {e}. Using dummy.")
            self._train_dummy()

    def _train_dummy(self):
        print("[URLAnalyzer] Using dummy data.")
        X_train = [[20, 2, 0, 1, 0, 0, 0, 0], [80, 5, 1, 0, 1, 2, 5, 1]]
        y_train = [0, 1]
        self.model = RandomForestClassifier(n_estimators=10, random_state=42)
        self.model.fit(X_train, y_train)

    def analyze(self, url):
        if '.' not in url or len(url) < 4:
            return -1, ["Invalid URL format. Please ensure it contains a domain (e.g. google.com)."]

        reasons, heuristic_score = self._explain(url)
        if heuristic_score == 0 and "Whitelisted" in str(reasons):
            return 0, reasons

        ml_score = 0
        
        if self.model:
            try:
                features = self._extract_features(url)
                ml_prob = self.model.predict_proba([features])[0][1]
                ml_score = int(ml_prob * 100)
            except Exception as e:
                print(f"[URLAnalyzer] Prediction error: {e}")

        final_score = max(ml_score, heuristic_score)
        final_score = min(final_score, 99) # Cap at 99
        
        return final_score, reasons


class EmailAnalyzer:
    def __init__(self):
        self.model = None

    def _explain(self, text):
        reasons = []
        heuristic_score = 0
        
        keywords = ['urgent', 'password', 'verify', 'suspended', 'account', 'bank', 'security', 'immediate', 'access', 'confirm', 'lottery', 'won', 'prize', 'winner', 'congratulations']
        found_keywords = [word for word in keywords if word in text.lower()]
        if found_keywords:
            reasons.append(f"Suspicious: High-pressure keywords: {', '.join(found_keywords)}.")
            heuristic_score += 40 + (len(found_keywords) * 10)
            
        if text.upper().count('URGENT') > 0 or text.count('!') > 3:
            reasons.append("Suspicious: Excessive urgency or capitalization.")
            heuristic_score += 20
            
        return reasons, heuristic_score

    def train(self):
        print("[EmailAnalyzer] Initializing training...")
        try:
            csv_path = os.path.join(os.path.dirname(__file__), '../datasets/phishing_email.csv')
            if os.path.exists(csv_path):
                print(f"[EmailAnalyzer] Loading dataset from {csv_path}...")
                df = pd.read_csv(csv_path)
                if 'body' in df.columns and 'label' in df.columns:
                    df = df.dropna(subset=['body', 'label'])
                    df = df.sample(n=min(5000, len(df)), random_state=42)
                    
                    X = df['body'].astype(str)
                    y = df['label']
                    
                    self.model = Pipeline([
                        ('tfidf', TfidfVectorizer(max_features=1000, stop_words='english')),
                        ('clf', MultinomialNB())
                    ])
                    self.model.fit(X, y)
                    print("[EmailAnalyzer] Model trained successfully.")
                else:
                    self._train_dummy()
            else:
                self._train_dummy()
        except Exception as e:
            print(f"[EmailAnalyzer] Training failed: {e}. Using dummy.")
            self._train_dummy()

    def _train_dummy(self):
        print("[EmailAnalyzer] Using dummy data.")
        X_train = ["Hello friend", "URGENT password reset"]
        y_train = [0, 1]
        self.model = Pipeline([('tfidf', TfidfVectorizer()), ('clf', MultinomialNB())])
        self.model.fit(X_train, y_train)

    def analyze(self, text):
        ml_score = 0
        reasons, heuristic_score = self._explain(text)
        
        if self.model:
            try:
                ml_prob = self.model.predict_proba([text])[0][1]
                ml_score = int(ml_prob * 100)
            except Exception as e:
                print(f"[EmailAnalyzer] Prediction error: {e}")

        final_score = max(ml_score, heuristic_score)
        final_score = min(final_score, 99)
        
        return final_score, reasons


class PhishingDetector:
    def __init__(self):
        self.url_analyzer = URLAnalyzer()
        self.email_analyzer = EmailAnalyzer()

    def train(self):
        print("--- Global Training Plan Started ---")
        self.url_analyzer.train()
        self.email_analyzer.train()
        print("--- Global Training Plan Complete ---")

    def predict(self, text, type='url'):
        score = 0
        reasons = []
        verdict = "Safe"
        
        try:
            if type == 'url':
                score, reasons = self.url_analyzer.analyze(text)
            elif type == 'email':
                score, reasons = self.email_analyzer.analyze(text)
            else:
                return {"risk_score": 0, "verdict": "Unknown", "reasons": ["Invalid Scan Type"]}
            
            # --- Verdict Logic ---
            if score == -1:
                return {
                    "risk_score": 0,
                    "verdict": "Invalid",
                    "reasons": reasons
                }
            
            if score < 50:
                verdict = "Safe"
                if not reasons and score > 0:
                    reasons = ["Low-level background noise detected (Safe)."]
                elif not reasons:
                    reasons = ["No significant threats detected."]
            elif score < 75:
                verdict = "Suspicious"
                if not reasons:
                    reasons.append(f"AI Behavior Analysis flagged this as anomaly ({score}% confidence).")
            else:
                verdict = "Malicious"
                if not reasons:
                     reasons.append(f"AI Model detected critical threat pattern ({score}% confidence).")

            return {
                "risk_score": score,
                "verdict": verdict,
                "reasons": reasons
            }

        except Exception as e:
            print(f"Global Prediction Error: {e}")
            return {
                "risk_score": 0,
                "verdict": "Error",
                "reasons": [str(e)]
            }

# Singleton Export
detector = PhishingDetector()
