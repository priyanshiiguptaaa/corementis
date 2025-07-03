/**
 * Service for communicating with the engagement analyzer API
 */

// Use the fixed engagement API
const API_BASE_URL = 'http://localhost:5000/api';

class EngagementService {
  /**
   * Check if the engagement analyzer API is available
   * @returns {Promise} - API status response
   */
  static async checkStatus() {
    try {
      // Try to fetch with a longer timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`${API_BASE_URL}/status`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      const data = await response.json();
      console.log('Status check result:', data);
      return data;
    } catch (error) {
      console.error('Error checking engagement analyzer status:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Initialize the engagement analyzer with a specific context
   * @param {string} context - The classroom context (lecture, interactive, exam)
   * @returns {Promise} - API response
   */
  static async initialize(context = 'lecture') {
    console.log(`Initializing engagement analyzer with context: ${context}`);
    try {
      // First check if the API is available
      const statusCheck = await this.checkStatus();
      if (!statusCheck.success) {
        console.warn('API status check failed, but continuing with initialization');
      }
      
      const response = await fetch(`${API_BASE_URL}/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify({ context }),
      });
      
      const result = await response.json();
      console.log('Initialize response:', result);
      return result;
    } catch (error) {
      console.error('Error initializing engagement analyzer:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Analyze a video frame for engagement
   * @param {string} imageData - Base64 encoded image data
   * @returns {Promise} - API response with engagement metrics
   */
  static async analyzeFrame(imageData) {
    console.log('Analyzing frame with API...');
    try {
      console.log(`Sending request to ${API_BASE_URL}/analyze`);
      console.log('Image data length:', imageData.length);
      
      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        body: JSON.stringify({ image: imageData }),
        mode: 'cors',
        credentials: 'omit'
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', [...response.headers.entries()]);
      
      if (!response.ok) {
        console.error('API response not OK:', response.status, response.statusText);
        return { success: false, message: `API error: ${response.status} ${response.statusText}` };
      }
      
      const result = await response.json();
      console.log('Analysis result from API:', result);
      
      // Verify history data
      if (result.success && result.history) {
        console.log('History data received from API:', result.history);
      } else if (result.success) {
        console.warn('No history data in successful API response');
      }
      
      return result;
    } catch (error) {
      console.error('Error analyzing frame:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Check if the engagement analyzer is initialized
   * @returns {Promise} - API response
   */
  static async getStatus() {
    try {
      const response = await fetch(`${API_BASE_URL}/status`);
      return await response.json();
    } catch (error) {
      console.error('Error checking engagement analyzer status:', error);
      return { initialized: false };
    }
  }
}

export default EngagementService;
