from sentence_transformers import SentenceTransformer
import os

def download_model():
    # Set model cache directory in the project
    model_dir = os.path.join(os.path.dirname(__file__), 'models', 'sentence-transformers')
    os.makedirs(model_dir, exist_ok=True)
    
    print("🚀 Starting model download...")
    try:
        # Force download and cache the model
        model = SentenceTransformer(
            'sentence-transformers/all-mpnet-base-v2',
            cache_folder=model_dir
        )
        print(f"✅ Model downloaded successfully to: {model_dir}")
        
        # Test the model to ensure it works
        test_text = "Hello, this is a test."
        embedding = model.encode(test_text)
        print("✅ Model working correctly!")
        
        return True
    except Exception as e:
        print(f"❌ Error downloading model: {str(e)}")
        return False

if __name__ == "__main__":
    download_model()