// Mock Chatbot logic engine

const emergencyKeywords = ['chest pain', 'breathless', 'can\'t breathe', 'heart', 'numbness', 'confusion', 'stroke', 'bleeding'];

export const generateBotResponse = (userText, turn) => {
  const lowerText = userText.toLowerCase();
  
  // Emergency check
  const hasEmergency = emergencyKeywords.some(kw => lowerText.includes(kw));

  if (hasEmergency) {
    return {
      text: "Warning: Your symptoms suggest a potentially seriously condition that may require urgent attention. Please seek immediate medical help or call emergency services right away. Do not wait. Can you confirm if you have already contacted emergency services?",
      readyForPrediction: true
    };
  }

  // Turn-based conversational flow
  if (turn === 2) {
    return {
      text: "I see. Could you briefly describe when these symptoms started and if they have been getting worse or staying the same?",
      readyForPrediction: false
    };
  } else if (turn === 3) {
    return {
      text: "Thank you for the additional context. Are you experiencing any other accompanying symptoms, like fever, tiredness, or nausea?",
      readyForPrediction: false
    };
  } else if (turn >= 4) {
    return {
      text: "Thank you. I have enough information to form a preliminary assessment based on standard symptom patterns. Would you like me to proceed with the prediction?",
      readyForPrediction: true
    };
  }
  
  // Fallback
  return {
    text: "Can you provide a little more detail?",
    readyForPrediction: false
  };
};
