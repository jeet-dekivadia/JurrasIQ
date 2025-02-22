import tensorflowjs as tfjs
from tensorflow.keras.models import load_model
import os

def convert_model():
    try:
        # Load the Keras model
        model_path = os.path.join('identification', 'model.h5')
        model = load_model(model_path)
        
        # Create output directory
        output_dir = os.path.join('public', 'identification', 'model')
        os.makedirs(output_dir, exist_ok=True)
        
        # Convert the model
        tfjs.converters.save_keras_model(model, output_dir)
        print("✓ Model converted successfully")
        
    except Exception as e:
        print(f"Error converting model: {str(e)}")
        exit(1)

if __name__ == "__main__":
    convert_model() 