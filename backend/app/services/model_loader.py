import os
import joblib
import pandas as pd
import numpy as np
from typing import Optional, Dict, Any
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')

class ModelLoader:
    """Load and manage ML models for predictions"""
    
    def __init__(self, models_dir: Optional[str] = None):
        self.models_dir = models_dir or os.path.join(
            Path(__file__).parent.parent.parent, "models"
        )
        self._models: Dict[str, Any] = {}
        self._feature_columns: Dict[str, list] = {}
    
    def load_model(self, model_name: str, model_path: Optional[str] = None) -> bool:
        """
        Load a model from file
        
        Args:
            model_name: Name identifier for the model (e.g., 'baseline', 'promo', 'stockout')
            model_path: Optional path to model file. If None, looks in models_dir
        
        Returns:
            True if model loaded successfully, False otherwise
        """
        try:
            if model_path is None:
                # Look for common model file names
                possible_names = [
                    f"{model_name}_model.joblib",
                    f"{model_name}.joblib",
                    f"model_{model_name}.joblib",
                ]
                
                model_path = None
                for name in possible_names:
                    full_path = os.path.join(self.models_dir, name)
                    if os.path.exists(full_path):
                        model_path = full_path
                        break
                
                if model_path is None:
                    print(f"Warning: Model file for '{model_name}' not found in {self.models_dir}")
                    return False
            
            if not os.path.exists(model_path):
                print(f"Warning: Model file not found: {model_path}")
                return False
            
            model = joblib.load(model_path)
            self._models[model_name] = model
            
            # Try to extract feature names if available
            if hasattr(model, 'feature_names_in_'):
                self._feature_columns[model_name] = list(model.feature_names_in_)
            elif hasattr(model, 'feature_importances_'):
                # If we have feature importances but no names, we'll need to match by position
                self._feature_columns[model_name] = None
            
            print(f"Successfully loaded model: {model_name} from {model_path}")
            return True
            
        except Exception as e:
            print(f"Error loading model '{model_name}': {str(e)}")
            return False
    
    def get_model(self, model_name: str) -> Optional[Any]:
        """Get a loaded model by name"""
        return self._models.get(model_name)
    
    def has_model(self, model_name: str) -> bool:
        """Check if a model is loaded"""
        return model_name in self._models
    
    def get_feature_columns(self, model_name: str) -> Optional[list]:
        """Get feature column names for a model"""
        return self._feature_columns.get(model_name)
    
    def predict(self, model_name: str, X: pd.DataFrame) -> np.ndarray:
        """
        Make predictions using a loaded model
        
        Args:
            model_name: Name of the model to use
            X: DataFrame with features
        
        Returns:
            Predictions array
        """
        if model_name not in self._models:
            raise ValueError(f"Model '{model_name}' not loaded")
        
        model = self._models[model_name]
        feature_cols = self._feature_columns.get(model_name)
        
        # If we have feature names, ensure columns match
        if feature_cols is not None:
            # Check if all required features are present
            missing_features = set(feature_cols) - set(X.columns)
            if missing_features:
                raise ValueError(f"Missing features: {missing_features}")
            
            # Reorder columns to match model expectations
            X = X[feature_cols]
        
        # Handle missing values
        X = X.fillna(0)
        
        # Make prediction
        predictions = model.predict(X)
        
        return predictions
    
    def predict_proba(self, model_name: str, X: pd.DataFrame) -> np.ndarray:
        """
        Make probability predictions (for classification models)
        
        Args:
            model_name: Name of the model to use
            X: DataFrame with features
        
        Returns:
            Probability predictions array
        """
        if model_name not in self._models:
            raise ValueError(f"Model '{model_name}' not loaded")
        
        model = self._models[model_name]
        
        if not hasattr(model, 'predict_proba'):
            raise ValueError(f"Model '{model_name}' does not support predict_proba")
        
        feature_cols = self._feature_columns.get(model_name)
        
        if feature_cols is not None:
            missing_features = set(feature_cols) - set(X.columns)
            if missing_features:
                raise ValueError(f"Missing features: {missing_features}")
            X = X[feature_cols]
        
        X = X.fillna(0)
        predictions = model.predict_proba(X)
        
        return predictions
    
    def load_all_models(self, model_config: Optional[Dict[str, str]] = None) -> Dict[str, bool]:
        """
        Load all models from configuration
        
        Args:
            model_config: Dict mapping model names to file paths
        
        Returns:
            Dict mapping model names to load success status
        """
        if model_config is None:
            # Default model names to look for
            model_config = {
                'baseline': None,
                'promo': None,
                'stockout': None,
                'lead_time': None,
            }
        
        results = {}
        for model_name, model_path in model_config.items():
            results[model_name] = self.load_model(model_name, model_path)
        
        return results

