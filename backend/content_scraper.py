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
            images = self._scrape_bing_method1(topic, limit * 2)  # Get more images than needed to filter
            
            if not images:
                logger.info("Method 1 failed, trying method 2")
                images = self._scrape_bing_method2(topic, limit * 2)
                
            if not images:
                logger.info("Method 2 failed, trying Google Images")
                images = self._scrape_bing_method1(topic, limit * 2)
            
            # Filter images to prioritize high-resolution ones
            filtered_images = self._filter_high_resolution_images(images, limit)
            
            return filtered_images
        except Exception as e:
            logger.error(f"Error scraping images: {e}")
            return []
            
    def _scrape_bing_method1(self, topic: str, limit: int = 5) -> List[str]:
        """First method to scrape Bing images"""
        try:
                search_url = f"https://www.bing.com/images/search?q={urllib.parse.quote(topic)}&form=HDRSC2"
                response = self.session.get(search_url, timeout=10)
                if response.status_code != 200:
                    logger.warning(f"Bing request failed: {response.status_code}")
                    return []

                soup = BeautifulSoup(response.content, 'html.parser')
                images = []
                for tag in soup.find_all("a", class_="iusc"):
                    m_json = tag.get("m")
                    if m_json:
                        match = re.search(r'"murl":"(.*?)"', m_json)
                        if match:
                            url = match.group(1).replace('\\u002f', '/').replace('\\', '')
                            if url.startswith("http") and not url.endswith(".webp"):
                                images.append(url)
                    if len(images) >= limit:
                        break
                return images
        except Exception as e:
                logger.error(f"Error scraping Bing: {e}")
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
            # Add high resolution to the search query and use the tbs parameter for large images
            search_query = f"{topic} high resolution"
            search_url = f"https://www.google.com/search?q={urllib.parse.quote(search_query)}&tbm=isch&tbs=isz:l"
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
                data_src = img.get('data-src', '')
                # Prioritize data-src as it often contains the full-size image
                if data_src and data_src.startswith('http') and not data_src.endswith('.gif'):
                    images.append(data_src)
                elif src and src.startswith('http') and not src.endswith('.gif') and not 'thumb' in src.lower():
                    images.append(src)
                if len(images) >= limit:
                    break
                    
            # If we still don't have images, try to extract from JSON data in scripts
            if not images:
                for script in soup.find_all('script'):
                    if script.string and 'AF_initDataCallback' in script.string:
                        image_urls = re.findall(r'"(https://[^"]+\.(jpg|png|jpeg))"', script.string)
                        for url, _ in image_urls:
                            if url not in images and not 'thumb' in url.lower() and not 'icon' in url.lower():
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

    def _filter_high_resolution_images(self, images: List[str], limit: int = 5) -> List[str]:
        """Filter images to prioritize high-resolution ones"""
        # Score images based on URL characteristics that suggest higher resolution
        scored_images = []
        for img in images:
            score = 0
            # Higher score for URLs containing resolution indicators
            if re.search(r'[0-9]{4,}x[0-9]{4,}', img):  # Prefer very high resolutions (4+ digits)
                score += 10
            elif re.search(r'[0-9]{3,4}x[0-9]{3,4}', img):  # Standard high resolutions
                score += 5
                
            # Check for resolution indicators in the URL
            if any(term in img.lower() for term in ['wallpaper', 'fullhd', '1080p', '4k', '2k', 'uhd']):
                score += 5
            if any(term in img.lower() for term in ['large', 'high', 'full', 'original', 'hd']):
                score += 3
                
            # Penalize low-resolution indicators
            if any(term in img.lower() for term in ['thumb', 'icon', 'small', 'preview', 'tiny', 'mobile']):
                score -= 5
                
            # Higher score for common high-quality image formats
            if img.lower().endswith('.png'):
                score += 2
            elif img.lower().endswith('.jpg') or img.lower().endswith('.jpeg'):
                score += 1
            elif img.lower().endswith('.webp'):  # WebP can be high quality but variable
                score += 0.5
                
            scored_images.append((img, score))
        
        # Sort by score (descending) and return the top ones
        sorted_images = [img for img, score in sorted(scored_images, key=lambda x: x[1], reverse=True)]
        return sorted_images[:limit]
        
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
        
        print(images)
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
        
