from content_scraper import search_content
import json

# Test the content scraper
topic = 'quantum physics'
images, videos = search_content(topic)

# Write results to a file
with open('scraper_test_results.txt', 'w') as f:
    f.write(f'Topic: {topic}\n')
    f.write(f'Found {len(images)} images and {len(videos)} videos\n')
    f.write(f'Sample images: {images[:2] if images else "None"}\n')
    f.write(f'Sample videos: {json.dumps(videos[:1], indent=2) if videos else "None"}\n')

print(f'Test completed. Results written to scraper_test_results.txt')
