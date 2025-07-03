import React, { useState, useEffect } from 'react';

/**
 * Detailed engagement analysis panel that shows in the side panel
 */
const EngagementPanel = ({ engagementData, isVisible }) => {
  // Initialize state hooks first, before any conditional returns
  const [historyData, setHistoryData] = useState([]);
  
  // Effect hook must be defined before any conditional returns
  useEffect(() => {
    if (engagementData && engagementData.history && engagementData.history.length > 0) {
      console.log('Engagement history data received:', engagementData.history);
      window.USING_REAL_DATA = true;
      setHistoryData(engagementData.history);
      console.log('History data set to:', engagementData.history);
    } else if (engagementData) {
      console.warn('No history data in engagement data or empty history array');
      if (!window.FORCE_REAL_DATA) {
        // Only use demo data if not forcing real data
        console.log('Using demo data as fallback');
      }
    }
  }, [engagementData]);
  
  // Now we can have the conditional return
  if (!isVisible) return null;
  
  // Default data if engagementData is missing
  const defaultData = {
    engagement_score: 75,
    trend: 'stable',
    raw_score: 75,
    component_scores: {
      attention: 0.8,
      emotion: 0.7,
      posture: 0.75,
      gaze: 0.72
    }
  };
  
  // Use provided data or fallback to defaults
  const data = engagementData || defaultData;
  const { engagement_score, trend, raw_score, component_scores = {} } = data;

  // Helper functions for visualization
  const getScoreColor = (score) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTextColor = (score) => {
    if (score >= 70) return 'text-green-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increasing':
        return '↑';
      case 'decreasing':
        return '↓';
      default:
        return '→';
    }
  };

  // Get engagement level text
  const getEngagementLevelText = (score) => {
    if (score >= 80) return 'Highly Engaged';
    if (score >= 60) return 'Engaged';
    if (score >= 40) return 'Moderately Engaged';
    if (score >= 20) return 'Distracted';
    return 'Disengaged';
  };

  // Get feedback based on engagement level
  const getFeedback = (score, trend) => {
    if (score >= 80) return 'You\'re showing excellent focus and participation!';
    if (score >= 60) {
      return trend === 'increasing' 
        ? 'Your engagement is improving. Keep it up!' 
        : 'You\'re engaged but try to maintain your focus.';
    }
    if (score >= 40) {
      return trend === 'increasing' 
        ? 'Your focus is getting better. Try to stay engaged.' 
        : 'Your engagement is dropping. Try to refocus on the class.';
    }
    return 'You seem distracted. Consider taking notes or asking questions to boost engagement.';
  };

  // Use real engagement history if available, otherwise generate sample data
  const engagementHistory = historyData.length > 0 ? 
    historyData.map((score, index) => {
      const time = `${(index + 1) * 5} min ago`;
      return { time, score };
    }).slice(0, 4) : [
      { time: '5 min ago', score: Math.min(100, Math.max(0, engagement_score + Math.floor(Math.random() * 20) - 10)) },
      { time: '10 min ago', score: Math.min(100, Math.max(0, engagement_score + Math.floor(Math.random() * 20) - 10)) },
      { time: '15 min ago', score: Math.min(100, Math.max(0, engagement_score + Math.floor(Math.random() * 20) - 10)) },
      { time: '20 min ago', score: Math.min(100, Math.max(0, engagement_score + Math.floor(Math.random() * 20) - 10)) },
    ];
    
  console.log('Engagement history being displayed:', engagementHistory);

  // Sample tips based on engagement level
  const getTips = (score) => {
    if (score >= 70) {
      return [
        'Continue actively participating in discussions',
        'Ask thoughtful questions about the material',
        'Take detailed notes to maintain focus'
      ];
    } else if (score >= 40) {
      return [
        'Try to minimize distractions around you',
        'Actively take notes to improve retention',
        'Consider asking questions to increase involvement'
      ];
    } else {
      return [
        'Find a quieter environment if possible',
        'Close other applications to reduce distractions',
        'Try to actively participate in the discussion',
        'Take short breaks between sessions to refresh'
      ];
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Engagement Analysis</h2>
        
        {/* Current engagement score */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Current Engagement</span>
            <span className={`text-lg font-bold ${getTextColor(engagement_score)}`}>
              {engagement_score}% {getTrendIcon(trend)}
            </span>
          </div>
          
          <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden mb-2">
            <div 
              className={`h-full ${getScoreColor(engagement_score)} transition-all duration-500 ease-in-out`}
              style={{ width: `${engagement_score}%` }}
            ></div>
          </div>
          
          <div className="text-center">
            <div className={`font-medium ${getTextColor(engagement_score)}`}>
              {getEngagementLevelText(engagement_score)}
            </div>
          </div>
        </div>
        
        {/* Feedback */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <h3 className="text-md font-bold mb-2">Feedback</h3>
          <p className="text-sm text-gray-300">{getFeedback(engagement_score, trend)}</p>
        </div>
        
        {/* Engagement history */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <h3 className="text-md font-bold mb-3">Engagement History</h3>
          <div className="space-y-2">
            {engagementHistory.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-400">{item.time}</span>
                <div className="flex items-center">
                  <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden mr-2">
                    <div 
                      className={`h-full ${getScoreColor(item.score)}`}
                      style={{ width: `${item.score}%` }}
                    ></div>
                  </div>
                  <span className="text-xs">{item.score}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Component scores if available */}
        {Object.keys(component_scores).length > 0 && (
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <h3 className="text-md font-bold mb-3">Engagement Components</h3>
            <div className="space-y-3">
              {Object.entries(component_scores).map(([key, value]) => (
                <div key={key}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm capitalize">{key.replace('_', ' ')}</span>
                    <span className="text-xs">{Math.round(value * 100)}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getScoreColor(Math.round(value * 100))}`}
                      style={{ width: `${Math.round(value * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Tips to improve engagement */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <h3 className="text-md font-bold mb-3">Tips to Improve Engagement</h3>
          <ul className="list-disc pl-5 space-y-2">
            {getTips(engagement_score).map((tip, index) => (
              <li key={index} className="text-sm text-gray-300">{tip}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EngagementPanel;
