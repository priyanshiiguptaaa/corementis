import React from 'react';

/**
 * Component to display engagement metrics in the classroom interface
 */
const EngagementIndicator = ({ engagementData, isVisible }) => {
  if (!isVisible || !engagementData) return null;

  const { engagement_score, trend, raw_score, component_scores = {} } = engagementData;
  
  // Determine color based on engagement score
  const getScoreColor = (score) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Determine text color based on engagement score
  const getTextColor = (score) => {
    if (score >= 70) return 'text-green-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Determine icon based on trend
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
    if (score >= 80) return 'Great focus!';
    if (score >= 60) {
      return trend === 'increasing' ? 'Good progress!' : 'Stay focused!';
    }
    if (score >= 40) {
      return trend === 'increasing' ? 'Getting better!' : 'Try to focus more';
    }
    return 'Consider taking a break';
  };

  return (
    <div className="absolute top-4 right-4 bg-intel-dark-blue bg-opacity-90 text-white p-3 rounded-lg shadow-lg z-50 w-48">
      <div className="text-center mb-2">
        <span className="text-sm font-bold">Engagement Monitor</span>
      </div>
      
      {/* Main score display */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-2xl font-bold">
          {engagement_score}%
        </div>
        <div className={`text-xl ${getTextColor(engagement_score)}`}>
          {getTrendIcon(trend)}
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden mb-2">
        <div 
          className={`h-full ${getScoreColor(engagement_score)} transition-all duration-500 ease-in-out`}
          style={{ width: `${engagement_score}%` }}
        ></div>
      </div>
      
      {/* Engagement level and feedback */}
      <div className="text-center mb-2">
        <div className={`font-medium ${getTextColor(engagement_score)}`}>
          {getEngagementLevelText(engagement_score)}
        </div>
        <div className="text-xs text-gray-300 mt-1">
          {getFeedback(engagement_score, trend)}
        </div>
      </div>
      
      {/* Component scores if available */}
      {Object.keys(component_scores).length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-600 text-xs">
          <div className="font-medium mb-1">Components:</div>
          {Object.entries(component_scores).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center">
              <span>{key.replace('_', ' ')}:</span>
              <span>{Math.round(value * 100)}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EngagementIndicator;
