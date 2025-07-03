import re
import time
from typing import List, Dict, Any, Optional

class ContextManager:
    """Manages conversation context for the chatbot"""
    
    def __init__(self, max_messages=20, max_tokens=4000):
        """Initialize the context manager
        
        Args:
            max_messages: Maximum number of messages to keep in context
            max_tokens: Approximate maximum number of tokens to keep in context
        """
        self.max_messages = max_messages
        self.max_tokens = max_tokens
    
    def manage_context(self, messages: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Manage the conversation context to prevent it from growing too large
        
        Args:
            messages: List of message dictionaries with 'role' and 'content' keys
            
        Returns:
            Managed list of messages
        """
        # If we're under the max messages, return as is
        if len(messages) <= self.max_messages:
            return messages
        
        # Extract system message if present
        system_message = None
        for msg in messages:
            if msg['role'] == 'system':
                system_message = msg
                break
        
        # Start with system message if it exists
        result = []
        if system_message:
            result.append(system_message)
        
        # Calculate how many recent messages we can include
        # We always want to include the most recent exchanges
        recent_count = min(self.max_messages - len(result), len(messages))
        recent_messages = messages[-recent_count:]
        
        # If we have older messages that will be excluded, create a summary
        older_messages = []
        if len(messages) > recent_count + len(result):
            # Determine where to start (after system message if present)
            start_idx = 1 if system_message else 0
            older_messages = messages[start_idx:-recent_count]
            
            if older_messages:
                summary = self.summarize_conversation(older_messages)
                result.append({
                    "role": "system",
                    "content": f"Previous conversation summary: {summary}"
                })
        
        # Add the recent messages
        result.extend(recent_messages)
        return result
    
    def summarize_conversation(self, messages: List[Dict[str, Any]], max_summary_length=300) -> str:
        """Create a summary of conversation messages
        
        Args:
            messages: List of message dictionaries to summarize
            max_summary_length: Maximum length of the summary
            
        Returns:
            A string summary of the conversation
        """
        if not messages:
            return "No previous conversation."
            
        # Extract user messages to identify main topics
        user_messages = [msg['content'] for msg in messages if msg['role'] == 'user']
        all_topics = []
        for msg in user_messages:
            all_topics.extend(self.extract_key_topics(msg))
            
        # Count topic frequencies
        topic_counts = {}
        for topic in all_topics:
            if topic in topic_counts:
                topic_counts[topic] += 1
            else:
                topic_counts[topic] = 1
                
        # Get the most frequent topics (up to 5)
        main_topics = sorted(topic_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        main_topics_str = ", ".join([topic for topic, _ in main_topics]) if main_topics else "general topics"
        
        # Extract user and assistant messages (skip system messages)
        content = []
        for msg in messages:
            if msg['role'] != 'system':
                # Truncate very long messages
                msg_content = msg['content']
                if len(msg_content) > 100:
                    msg_content = msg_content[:97] + '...'
                content.append(f"{msg['role']}: {msg_content}")
        
        # Create a more informative summary
        summary_intro = f"Previous conversation about {main_topics_str}. "        
        
        # Join with newlines and truncate
        message_summary = "\n".join(content)
        if len(summary_intro) + len(message_summary) > max_summary_length:
            available_length = max_summary_length - len(summary_intro) - 3  # Account for "..."
            message_summary = message_summary[:available_length] + "..."
        
        return summary_intro + message_summary
    
    def extract_key_topics(self, text: str) -> List[str]:
        """Extract potential key topics from text using simple heuristics
        
        Args:
            text: Text to extract topics from
            
        Returns:
            List of potential topic keywords
        """
        # Define technical domain stopwords to prevent defaulting to these topics
        tech_stopwords = {
            'computer', 'vision', 'machine', 'learning', 'neural', 'network',
            'algorithm', 'model', 'training', 'dataset', 'feature', 'classification',
            'detection', 'segmentation', 'recognition', 'opencv', 'tensorflow',
            'pytorch', 'keras', 'deep', 'convolutional', 'recurrent', 'transformer'
        }
        
        # Common English stopwords
        common_stopwords = {
            'about', 'above', 'after', 'again', 'against', 'all', 'and', 'any',
            'are', 'because', 'been', 'before', 'being', 'below', 'between', 'both',
            'but', 'by', 'could', 'did', 'does', 'doing', 'down', 'during', 'each',
            'few', 'for', 'from', 'further', 'had', 'has', 'have', 'having', 'here',
            'how', 'into', 'itself', 'just', 'more', 'most', 'other', 'our', 'out',
            'over', 'own', 'same', 'should', 'some', 'such', 'than', 'that', 'the',
            'their', 'them', 'then', 'there', 'these', 'they', 'this', 'those',
            'through', 'under', 'until', 'very', 'was', 'were', 'what', 'when',
            'where', 'which', 'while', 'who', 'whom', 'why', 'will', 'with', 'you'
        }
        
        # Extract potential noun phrases and meaningful words
        # Look for capitalized terms which are often proper nouns/topics
        capitalized_terms = re.findall(r'\b[A-Z][a-z]{3,}\b', text)
        
        # Find all words with 4+ characters
        all_words = re.findall(r'\b[A-Za-z]{4,}\b', text.lower())
        
        # Filter out stopwords and technical terms unless they appear in capitalized form
        filtered_words = [w.lower() for w in all_words 
                         if w.lower() not in common_stopwords 
                         and (w.lower() not in tech_stopwords or w in capitalized_terms)]
        
        # Look for multi-word phrases that might be topics
        phrases = re.findall(r'\b[A-Za-z][a-z]+ [A-Za-z][a-z]+\b', text)
        
        # Combine single words and phrases, remove duplicates
        topics = list(set(filtered_words + [p.lower() for p in phrases]))
        
        # Only include technical terms if they're explicitly mentioned in the original text case
        for term in tech_stopwords:
            if term in text.lower() and re.search(r'\b' + re.escape(term) + r'\b', text.lower()):
                topics.append(term)
                
        return topics
    
    def estimate_tokens(self, text: str) -> int:
        """Estimate the number of tokens in a text
        
        Args:
            text: Text to estimate tokens for
            
        Returns:
            Estimated token count
        """
        # Simple estimation: ~4 characters per token on average
        return len(text) // 4
    
    def track_topic_shift(self, messages: List[Dict[str, Any]], new_message: str) -> bool:
        """Detect if there's a significant topic shift in the conversation
        
        Args:
            messages: Previous conversation messages
            new_message: New message to check against
            
        Returns:
            True if a topic shift is detected, False otherwise
        """
        if len(messages) < 2:
            return False
            
        # Check for explicit topic change indicators in the new message
        topic_change_phrases = [
            "let's talk about", "can we discuss", "tell me about", "what is", 
            "explain", "instead", "change topic", "different topic", 
            "another question", "new topic", "switching gears"
        ]
        
        for phrase in topic_change_phrases:
            if phrase in new_message.lower():
                return True
        
        # Get topics from the last few messages (only user and assistant messages)
        user_assistant_messages = [msg for msg in messages if msg['role'] in ('user', 'assistant')]
        if len(user_assistant_messages) < 2:
            return False
            
        recent_text = " ".join([msg['content'] for msg in user_assistant_messages[-3:]])
        recent_topics = set(self.extract_key_topics(recent_text))
        
        # Get topics from the new message
        new_topics = set(self.extract_key_topics(new_message))
        
        # If the new message is very short, it might be a follow-up question
        if len(new_message.split()) < 6 and any(w in new_message.lower() for w in ["this", "it", "that", "these", "those"]):
            return False  # Likely a follow-up question referring to previous context
        
        # If there's little overlap between topics, it might be a topic shift
        if len(recent_topics) > 0 and len(new_topics) > 0:
            overlap = recent_topics.intersection(new_topics)
            overlap_ratio = len(overlap) / max(len(recent_topics), len(new_topics))
            
            # More sensitive threshold for topic shift detection
            return overlap_ratio < 0.15  # Less than 15% overlap suggests a topic shift
        
        return False
