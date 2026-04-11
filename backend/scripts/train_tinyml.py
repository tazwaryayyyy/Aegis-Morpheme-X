import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from pathlib import Path

def generate_synthetic_data(n_samples=1000):
    """
    Generate synthetic MFCC features (13 coefficients) for cough risk.
    - Low Risk (0): Normal background or clear breath.
    - Medium Risk (1): Mild congestion.
    - High Risk (2): Sharp, characteristic cough.
    """
    np.random.seed(42)
    
    # Features: MFCC 0-12
    # Feature distribution logic:
    # MFCC 0 often represents energy.
    # Higher order MFCCs represent spectral envelope.
    
    # Class 0: Low Risk
    X_0 = np.random.normal(loc=10.0, scale=2.0, size=(n_samples // 3, 13))
    y_0 = np.zeros(n_samples // 3)
    
    # Class 1: Medium Risk
    X_1 = np.random.normal(loc=15.0, scale=3.0, size=(n_samples // 3, 13))
    # Shift some coefficients to differentiate
    X_1[:, 1:4] += 5.0 
    y_1 = np.ones(n_samples // 3)
    
    # Class 2: High Risk
    X_2 = np.random.normal(loc=25.0, scale=5.0, size=(n_samples // 3, 13))
    # Significant shift in spectral characteristics
    X_2[:, 0] += 10.0
    X_2[:, 5:10] -= 8.0
    y_2 = np.full(n_samples // 3, 2)
    
    X = np.vstack([X_0, X_1, X_2])
    y = np.concatenate([y_0, y_1, y_2])
    
    return X, y

def train_and_save():
    print("Generating synthetic MFCC data...")
    X, y = generate_synthetic_data()
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training RandomForestClassifier...")
    clf = RandomForestClassifier(n_estimators=50, max_depth=5, random_state=42)
    clf.fit(X_train, y_train)
    
    accuracy = clf.score(X_test, y_test)
    print(f"Model trained with accuracy: {accuracy:.4f}")
    
    # Ensure directory exists
    output_dir = Path(__file__).parent.parent / "one_health"
    output_dir.mkdir(exist_ok=True)
    
    model_path = output_dir / "cough_model.joblib"
    print(f"Saving model to {model_path}...")
    joblib.dump(clf, model_path)
    print("Done!")

if __name__ == "__main__":
    train_and_save()
