import time
import os
import numpy as np
import whisper
import easyocr
from PIL import Image
import torch

# Import our optimization module
from openvino_optimization import optimize_whisper_model, optimize_easyocr, measure_inference_time, get_model_memory_usage

def benchmark_whisper(audio_file=None):
    """Benchmark Whisper model performance with and without OpenVINO optimization"""
    print("\n===== WHISPER MODEL BENCHMARK =====\n")
    
    # Create a sample audio file if none provided
    if audio_file is None or not os.path.exists(audio_file):
        print("No audio file provided for benchmark. Using a default test file if available.")
        audio_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'temp_audio.webm')
        if not os.path.exists(audio_file):
            print(f"Warning: No test audio file found at {audio_file}")
            print("Please provide an audio file or use the speech-to-text endpoint first to create a test file.")
            return
    
    # Load standard Whisper model
    print("Loading standard Whisper model...")
    start_time = time.time()
    standard_model = whisper.load_model("tiny")
    standard_load_time = time.time() - start_time
    print(f"Standard model loaded in {standard_load_time:.2f} seconds")
    
    # Get memory usage
    standard_memory = get_model_memory_usage(standard_model)
    print(f"Standard model memory usage: {standard_memory:.2f} MB")
    
    # Benchmark standard model
    print("\nBenchmarking standard Whisper model...")
    start_time = time.time()
    standard_result = standard_model.transcribe(audio_file)
    standard_inference_time = time.time() - start_time
    print(f"Standard model inference time: {standard_inference_time:.2f} seconds")
    
    # Load OpenVINO optimized model
    print("\nLoading OpenVINO optimized Whisper model...")
    start_time = time.time()
    optimized_model, core = optimize_whisper_model()
    optimized_load_time = time.time() - start_time
    print(f"Optimized model loaded in {optimized_load_time:.2f} seconds")
    print(f"Available OpenVINO devices: {core.available_devices if core else 'None'}")
    
    # Benchmark optimized model
    print("\nBenchmarking OpenVINO optimized Whisper model...")
    start_time = time.time()
    optimized_result = optimized_model.transcribe(audio_file)
    optimized_inference_time = time.time() - start_time
    print(f"Optimized model inference time: {optimized_inference_time:.2f} seconds")
    
    # Compare results
    print("\n===== WHISPER BENCHMARK RESULTS =====\n")
    print(f"Standard model load time: {standard_load_time:.2f} seconds")
    print(f"Optimized model load time: {optimized_load_time:.2f} seconds")
    print(f"Standard model inference time: {standard_inference_time:.2f} seconds")
    print(f"Optimized model inference time: {optimized_inference_time:.2f} seconds")
    print(f"Standard model memory usage: {standard_memory:.2f} MB")
    print(f"Speed improvement: {(standard_inference_time / optimized_inference_time):.2f}x faster")
    
    # Check transcription quality
    standard_text = standard_result["text"].strip()
    optimized_text = optimized_result["text"].strip()
    print(f"\nStandard model transcription: {standard_text}")
    print(f"Optimized model transcription: {optimized_text}")

def benchmark_easyocr(image_file=None):
    """Benchmark EasyOCR performance with and without OpenVINO optimization"""
    print("\n===== EASYOCR MODEL BENCHMARK =====\n")
    
    # Create a sample image if none provided
    if image_file is None or not os.path.exists(image_file):
        print("No image file provided for benchmark. Creating a test image...")
        # Create a simple test image with text
        from PIL import Image, ImageDraw, ImageFont
        img = Image.new('RGB', (400, 100), color=(255, 255, 255))
        d = ImageDraw.Draw(img)
        try:
            font = ImageFont.truetype("arial.ttf", 20)
        except IOError:
            font = ImageFont.load_default()
        d.text((10, 40), "OpenVINO OCR Test", fill=(0, 0, 0), font=font)
        image_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'test_image.png')
        img.save(image_file)
        print(f"Created test image at {image_file}")
    
    # Load the image
    image = Image.open(image_file)
    image_np = np.array(image)
    
    # Load standard EasyOCR
    print("Loading standard EasyOCR...")
    start_time = time.time()
    standard_reader = easyocr.Reader(['en'], gpu=False)
    standard_load_time = time.time() - start_time
    print(f"Standard EasyOCR loaded in {standard_load_time:.2f} seconds")
    
    # Benchmark standard EasyOCR
    print("\nBenchmarking standard EasyOCR...")
    start_time = time.time()
    standard_results = standard_reader.readtext(image_np)
    standard_inference_time = time.time() - start_time
    standard_text = ' '.join([text for _, text, _ in standard_results])
    print(f"Standard EasyOCR inference time: {standard_inference_time:.2f} seconds")
    
    # Load OpenVINO optimized EasyOCR
    print("\nLoading OpenVINO optimized EasyOCR...")
    start_time = time.time()
    optimized_reader, core = optimize_easyocr()
    optimized_load_time = time.time() - start_time
    print(f"Optimized EasyOCR loaded in {optimized_load_time:.2f} seconds")
    print(f"Available OpenVINO devices: {core.available_devices if core else 'None'}")
    
    # Benchmark optimized EasyOCR
    print("\nBenchmarking OpenVINO optimized EasyOCR...")
    start_time = time.time()
    optimized_results = optimized_reader.readtext(image_np)
    optimized_inference_time = time.time() - start_time
    optimized_text = ' '.join([text for _, text, _ in optimized_results])
    print(f"Optimized EasyOCR inference time: {optimized_inference_time:.2f} seconds")
    
    # Compare results
    print("\n===== EASYOCR BENCHMARK RESULTS =====\n")
    print(f"Standard EasyOCR load time: {standard_load_time:.2f} seconds")
    print(f"Optimized EasyOCR load time: {optimized_load_time:.2f} seconds")
    print(f"Standard EasyOCR inference time: {standard_inference_time:.2f} seconds")
    print(f"Optimized EasyOCR inference time: {optimized_inference_time:.2f} seconds")
    print(f"Speed improvement: {(standard_inference_time / optimized_inference_time):.2f}x faster")
    
    # Check OCR quality
    print(f"\nStandard EasyOCR text: {standard_text}")
    print(f"Optimized EasyOCR text: {optimized_text}")
    
    # Clean up test image if we created it
    if image_file == os.path.join(os.path.dirname(os.path.abspath(__file__)), 'test_image.png'):
        try:
            os.remove(image_file)
            print(f"Removed test image {image_file}")
        except Exception as e:
            print(f"Error removing test image: {e}")

if __name__ == "__main__":
    print("===== OPENVINO OPTIMIZATION BENCHMARK =====\n")
    print("This script benchmarks the performance improvements from OpenVINO optimization")
    print("for both Whisper speech-to-text and EasyOCR image-to-text models.\n")
    
    # Check if CUDA is available for PyTorch
    cuda_available = torch.cuda.is_available()
    print(f"CUDA available for PyTorch: {cuda_available}")
    if cuda_available:
        print(f"CUDA device: {torch.cuda.get_device_name(0)}")
    
    # Run benchmarks
    benchmark_whisper()
    benchmark_easyocr()
    
    print("\n===== BENCHMARK COMPLETE =====\n")
    print("The benchmark results show the performance improvements from OpenVINO optimization.")
    print("OpenVINO INT8 quantization can significantly reduce memory usage and improve inference speed,")
    print("especially on Intel hardware with dedicated AI acceleration capabilities.")
