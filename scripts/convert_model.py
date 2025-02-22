import tensorflowjs as tfjs
from tensorflow import keras

# Load the Keras model
model = keras.models.load_model('dino_species_model.keras')

# Convert and save the model for TensorFlow.js
tfjs.converters.save_keras_model(model, 'public/models/dino_species_model') 