import requests
import json

# Test the API endpoint
try:
    response = requests.post('http://localhost:5001/api/chatbot/search-content', 
                           json={'topic': 'quantum physics'},
                           timeout=10)
    
    # Write results to a file
    with open('api_test_results.txt', 'w') as f:
        f.write(f'Status code: {response.status_code}\n')
        if response.status_code == 200:
            data = response.json()
            f.write(f'Success: {data.get("success")}\n')
            f.write(f'Images found: {len(data.get("images", []))}\n')
            f.write(f'Videos found: {len(data.get("videos", []))}\n')
            f.write(f'Processing time: {data.get("processing_time")}\n')
            
            # Write sample data
            f.write('\nSample image URLs:\n')
            for img in data.get('images', [])[:2]:
                f.write(f'- {img}\n')
                
            f.write('\nSample video data:\n')
            for video in data.get('videos', [])[:2]:
                f.write(f'- Title: {video.get("title")}\n')
                f.write(f'  URL: {video.get("url")}\n')
        else:
            f.write(f'Error: {response.text}\n')
            
    print('API test completed. Results written to api_test_results.txt')
    
except Exception as e:
    print(f'Error testing API: {e}')
    with open('api_test_results.txt', 'w') as f:
        f.write(f'Error: {str(e)}\n')
