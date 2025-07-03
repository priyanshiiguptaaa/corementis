# CoreMentis Chatbot with OpenVINO Optimization

This document describes the implementation of OpenVINO-based model optimization for the CoreMentis AI chatbot's speech-to-text and image-to-text features.

## Overview

The CoreMentis chatbot has been enhanced with OpenVINO optimization to improve performance and reduce memory usage for computationally intensive tasks like speech recognition and optical character recognition (OCR). The implementation includes:

1. Hardware acceleration using OpenVINO runtime
2. INT8 quantization for reduced memory footprint
3. Graceful fallback mechanisms when OpenVINO optimization is not available
4. Performance monitoring and benchmarking

## Components

### 1. OpenVINO Optimization Module (`openvino_optimization.py`)

This module provides functions to optimize both Whisper (speech-to-text) and EasyOCR (image-to-text) models using OpenVINO:

- `optimize_whisper_model()`: Optimizes the Whisper model with OpenVINO, checking for available hardware and applying INT8 quantization when possible
- `optimize_easyocr()`: Enhances EasyOCR with OpenVINO acceleration, prioritizing GPU usage when available
- `measure_inference_time()`: Utility function to measure model inference performance
- `get_model_memory_usage()`: Utility function to measure model memory consumption

### 2. Context Management Module (`context_manager.py`)

This module provides intelligent conversation context management features:

- **Sliding Window Context**: Limits the number of messages sent to the LLM to prevent token overflow
- **Conversation Summarization**: Summarizes older parts of the conversation to preserve context
- **Topic Shift Detection**: Identifies when the conversation moves to a new subject
- **Key Topic Extraction**: Identifies important topics in the conversation
- **Multimodal Context Integration**: Maintains context across different input modalities (text, speech, images)
- **Cross-modal Context References**: Allows the chatbot to reference content from one modality in another

### 3. Optimized Chatbot API (`chatbot_api_optimized.py`)

An enhanced version of the original chatbot API that integrates the OpenVINO-optimized models:

- Initializes optimized Whisper and EasyOCR models with fallback mechanisms
- Provides endpoints for speech-to-text and image-to-text processing
- Includes performance metrics and status reporting
- Maintains full compatibility with the original API
- Implements intelligent context management for better conversation flow
- Detects topic shifts and maintains conversation coherence

### 4. Benchmark Script (`benchmark_openvino.py`)

A utility script to measure and compare the performance of standard and OpenVINO-optimized models:

- Benchmarks Whisper model with and without optimization
- Benchmarks EasyOCR with and without optimization
- Reports load time, inference time, and memory usage improvements

## API Endpoints

- `/api/chatbot/status` - Get the status of the chatbot API and available optimizations
- `/api/chatbot/initialize` - Initialize a chatbot session for a user
- `/api/chatbot/message` - Send a message to the chatbot with context management
- `/api/chatbot/speech-to-text` - Convert speech to text using Whisper and integrate with conversation context
- `/api/chatbot/image-to-text` - Extract text from images using EasyOCR and integrate with conversation context
- `/api/chatbot/history` - Get conversation history for a user
- `/api/chatbot/clear` - Clear conversation history for a user
- `/api/chatbot/performance` - Get performance metrics for the optimized models
- `/api/chatbot/context-summary` - Get a summary of the current conversation context including multimodal inputs

## Hardware Support

The OpenVINO optimization automatically detects and utilizes available hardware:

- CPU: Always supported with potential acceleration on Intel processors
- GPU: Used when available, with significant performance improvements
- VPU/NPU: Supported if present (Intel Neural Compute Stick, etc.)

## INT8 Quantization

The implementation includes placeholders for full INT8 quantization, which requires:

1. Calibration datasets for both Whisper and EasyOCR models
2. ONNX export of the PyTorch models
3. Quantization using OpenVINO's Post-Training Optimization Tool

These steps are marked as future work in the code.

## Fallback Mechanisms

The system includes robust fallback mechanisms:

1. If OpenVINO optimization fails, the system falls back to standard PyTorch models
2. If GPU acceleration is unavailable, the system uses CPU
3. If model loading fails, appropriate error messages are returned

## Usage

### Running the Optimized API

```bash
python chatbot_api_optimized.py
```

### Running the Benchmark

```bash
python benchmark_openvino.py
```

## Dependencies

- Flask and Flask-CORS for the API
- OpenVINO runtime for optimization
- Whisper for speech-to-text
- EasyOCR for image-to-text
- Groq client for LLM inference
- PyTorch as the base framework
- Pillow and NumPy for image processing

## Future Improvements

1. Implement full INT8 quantization with calibration datasets
2. Add support for multiple languages in OCR
3. Implement multi-page OCR processing
4. Explore alternative models if needed
5. Add more comprehensive benchmarking across different hardware configurations
