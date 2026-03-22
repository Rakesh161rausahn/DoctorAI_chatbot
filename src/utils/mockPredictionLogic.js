// Mock Prediction Engine

export const runPredictionEngine = (allSymptomsString) => {
  const s = allSymptomsString.toLowerCase();

  // Basic mock rule-based engine
  if (s.includes('chest pain') || s.includes('breathless')) {
    return {
      condition: "Possible Cardiovascular Issue",
      confidence: "High",
      riskLevel: "High",
      advisory: "Your symptoms indicate a potentially serious condition needing urgent evaluation.",
      explanation: "Chest pain and breathlessness are classic signs of cardiovascular or severe respiratory issues, which require an immediate professional diagnosis.",
      actions: [
        "Seek emergency medical attention immediately",
        "Do not ignore these symptoms or wait",
        "Avoid any strenuous physical activity",
        "Keep yourself calm and rest while waiting for help"
      ]
    };
  }

  if (s.includes('fever') && s.includes('cough')) {
    return {
      condition: "Viral Respiratory Infection",
      confidence: "Moderate",
      riskLevel: "Moderate",
      advisory: "Watch your symptoms closely. If breathing becomes difficult, seek help.",
      explanation: "Fever and cough commonly point to a viral infection like the flu or early stages of other respiratory illnesses. Monitoring is essential.",
      actions: [
        "Rest and stay hydrated",
        "Monitor your temperature regularly",
        "Avoid contact with others to prevent spreading",
        "Consult a doctor if symptoms persist beyond 3-5 days or worsen"
      ]
    };
  }

  if (s.includes('headache')) {
    return {
      condition: "Tension Headache or Migraine",
      confidence: "Low",
      riskLevel: "Low",
      advisory: "Monitor your pain levels. Consider resting in a quiet environment.",
      explanation: "Headaches are often caused by stress, dehydration, or lack of sleep, but can also be triggered by other underlying non-critical conditions.",
      actions: [
        "Drink plenty of water",
        "Rest in a dark, quiet room",
        "Try over-the-counter pain relievers if appropriate",
        "See a doctor if the headache is unusually severe or accompanied by vision changes"
      ]
    };
  }

  // Fallback prediction
  return {
    condition: "General Malaise / Undifferentiated Symptoms",
    confidence: "Low",
    riskLevel: "Low",
    advisory: "Your symptoms do not clearly point to a specific condition in our current model.",
    explanation: "Because the symptoms are broad or unspecific, the AI cannot generate a reliable pinpoint prediction. A healthcare provider is best suited to evaluate this.",
    actions: [
      "Schedule a routine checkup with a physician",
      "Keep a symptom diary tracking severity and time",
      "Maintain hydration and adequate nutrition",
      "Seek immediate care if you develop sudden, severe symptoms"
    ]
  };
};
