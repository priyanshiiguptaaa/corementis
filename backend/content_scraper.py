import requests
from bs4 import BeautifulSoup
import re
import urllib.parse
import time
import json
from typing import List, Tuple, Dict
import logging

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ContentScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
                          '(KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })

    def scrape_bing_images(self, topic: str, limit: int = 5) -> List[str]:
        """Scrape high-quality image URLs from Bing"""
        try:
            # Try multiple methods to get images
            images = self._scrape_bing_method1(topic, limit)
            
            if not images:
                logger.info("Method 1 failed, trying method 2")
                images = self._scrape_bing_method2(topic, limit)
                
            if not images:
                logger.info("Method 2 failed, trying Google Images")
                images = self._scrape_google_images(topic, limit)
                
            return images
        except Exception as e:
            logger.error(f"Error scraping images: {e}")
            return []
            
    def _scrape_bing_method1(self, topic: str, limit: int = 5) -> List[str]:
        """First method to scrape Bing images"""
        try:
            search_url = f"https://www.bing.com/images/search?q={urllib.parse.quote(topic)}&form=HDRSC2"
            response = self.session.get(search_url, timeout=10)
            if response.status_code != 200:
                return []

            soup = BeautifulSoup(response.content, 'html.parser')
            images = []
            
            # Look for image data in script tags
            for script in soup.find_all('script'):
                if script.string and 'iurl' in script.string:
                    matches = re.findall(r'"iurl":"(https?://[^"]+)"', script.string)
                    for url in matches:
                        clean_url = url.replace('\\', '')
                        if clean_url.startswith('http') and not clean_url.endswith('.webp'):
                            images.append(clean_url)
                            if len(images) >= limit:
                                return images
            return images
        except Exception as e:
            logger.error(f"Error in method 1: {e}")
            return []
    
    def _scrape_bing_method2(self, topic: str, limit: int = 5) -> List[str]:
        """Second method to scrape Bing images"""
        try:
            search_url = f"https://www.bing.com/images/search?q={urllib.parse.quote(topic)}&form=HDRSC2"
            response = self.session.get(search_url, timeout=10)
            if response.status_code != 200:
                return []

            soup = BeautifulSoup(response.content, 'html.parser')
            images = []
            
            # Look for image elements
            for img in soup.find_all('img'):
                src = img.get('src', '')
                data_src = img.get('data-src', '')
                if src and src.startswith('http') and not src.endswith('.svg'):
                    images.append(src)
                elif data_src and data_src.startswith('http'):
                    images.append(data_src)
                if len(images) >= limit:
                    break
            return images
        except Exception as e:
            logger.error(f"Error in method 2: {e}")
            return []
    
    def _scrape_google_images(self, topic: str, limit: int = 5) -> List[str]:
        """Fallback method using Google Images"""
        try:
            search_url = f"https://www.google.com/search?q={urllib.parse.quote(topic)}&tbm=isch"
            self.session.headers.update({
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
                            '(KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            })
            response = self.session.get(search_url, timeout=10)
            if response.status_code != 200:
                return []

            soup = BeautifulSoup(response.content, 'html.parser')
            images = []
            
            # Try to find image URLs in the page
            for img in soup.find_all('img'):
                src = img.get('src', '')
                if src and src.startswith('http') and not src.endswith('.gif'):
                    images.append(src)
                if len(images) >= limit:
                    break
                    
            # If we still don't have images, try to extract from JSON data in scripts
            if not images:
                for script in soup.find_all('script'):
                    if script.string and 'AF_initDataCallback' in script.string:
                        image_urls = re.findall(r'"(https://[^"]+\.(jpg|png|jpeg))"', script.string)
                        for url, _ in image_urls:
                            if url not in images:
                                images.append(url)
                            if len(images) >= limit:
                                break
                        if len(images) >= limit:
                            break
            return images
        except Exception as e:
            logger.error(f"Error in Google method: {e}")
            return []

    def scrape_youtube_videos(self, topic: str, limit: int = 3) -> List[Dict[str, str]]:
        """Scrape YouTube video links."""
        try:
            query = f"{topic} educational"
            search_url = f"https://www.youtube.com/results?search_query={urllib.parse.quote(query)}"
            response = self.session.get(search_url, timeout=10)
            if response.status_code != 200:
                logger.warning(f"YouTube request failed: {response.status_code}")
                return []

            pattern = r'"videoId":"(.*?)".*?"title":{"runs":\[{"text":"(.*?)"}\]'
            matches = re.findall(pattern, response.text)
            videos = []
            seen = set()
            for vid, title in matches:
                if vid not in seen:
                    videos.append({"title": title, "url": f"https://www.youtube.com/watch?v={vid}"})
                    seen.add(vid)
                if len(videos) >= limit:
                    break
            return videos
        except Exception as e:
            logger.error(f"Error scraping YouTube: {e}")
            return []

    def search(self, topic: str) -> Tuple[List[str], List[Dict[str, str]]]:
        if not topic.strip():
            return [], []
        logger.info(f"Searching content for topic: {topic}")
        images = self.scrape_bing_images(topic)
        videos = self.scrape_youtube_videos(topic)
        
        # Log the results
        logger.info(f"Found {len(images)} images and {len(videos)} videos for topic: {topic}")
        if not images:
            logger.warning(f"No images found for topic: {topic}")
        
        return images, videos

# Initialize a global instance
scraper = ContentScraper()

def search_content(topic: str) -> Tuple[List[str], List[Dict[str, str]]]:
    """Search for images and videos on a given topic"""
    if not topic.strip():
        return [], []
    try:
        # Use a shorter topic for better search results
        search_topic = topic
        if len(topic) > 100:
            # Extract key phrases if topic is too long
            search_topic = ' '.join(topic.split()[:10])
            logger.info(f"Topic too long, shortened to: {search_topic}")
            
        return scraper.search(search_topic)
    except Exception as e:
        logger.error(f"Error in search_content: {e}")
        return [], []
        logger.error(f"Search error: {e}")
        return [], []
