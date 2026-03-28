import React, { useState } from 'react';
import Header from './components/Header';
import ChatbotPanel from './components/ChatbotPanel';
import PredictionPanel from './components/PredictionPanel';
import ResultPanel from './components/ResultPanel';
// Utilities
import { generateBotResponse, runPredictionEngine } from './utils/aiLogic';

function App() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Hello. I am the AI Disease Predictor. I can help analyze your symptoms and provide an initial health assessment. Please keep in mind this is for informational purposes only. Let's start—what symptoms are you experiencing today?"
    }
  ]);
  const [symptomData, setSymptomData] = useState([]);
  const [readyForPrediction, setReadyForPrediction] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);

  const handleSendMessage = async (text) => {
    const newUserMsg = { id: Date.now(), sender: 'user', text };
    const typingMsgId = Date.now() + 1;
    setMessages((prev) => [
      ...prev,
      newUserMsg,
      { id: typingMsgId, sender: 'bot', text: 'Typing...' }
    ]);

    try {
      const response = await generateBotResponse(text, symptomData);

      setSymptomData((prev) => [...prev, text]);
      setMessages((prev) => [
        ...prev.filter(m => m.id !== typingMsgId),
        { id: Date.now() + 2, sender: 'bot', text: response.text }
      ]);

      if (response.readyForPrediction) {
        setReadyForPrediction(true);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev.filter(m => m.id !== typingMsgId),
        {
          id: Date.now() + 2,
          sender: 'bot',
          text: 'Request failed or timed out. Please try again.'
        }
      ]);
    }
  };

  const handlePredict = async () => {
    try {
      setIsPredicting(true);
      const result = await runPredictionEngine(symptomData.join(' '));
      setPredictionResult(result);
    } finally {
      setIsPredicting(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: 1,
        sender: 'bot',
        text: "Let's start a new assessment. What symptoms are you experiencing?"
      }
    ]);
    setSymptomData([]);
    setReadyForPrediction(false);
    setPredictionResult(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8 max-w-5xl mx-auto">
      <Header />
      
      <main className="w-full flex-grow flex flex-col gap-6 mt-6">
        {!predictionResult ? (
          <>
            <ChatbotPanel messages={messages} onSendMessage={handleSendMessage} />
            {readyForPrediction && (
              <PredictionPanel onPredict={handlePredict} isPredicting={isPredicting} />
            )}
          </>
        ) : (
          <ResultPanel result={predictionResult} onReset={handleReset} />
        )}
      </main>
      
      <footer className="mt-12 text-center text-sm text-slate-500 mb-6 w-full">
        <p><strong>Disclaimer:</strong> This tool provides informational guidance only and is not a medical diagnosis. Always consult a healthcare professional for serious or persistent symptoms.</p>
      </footer>
    </div>
  );
}

export default App;
