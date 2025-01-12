import React, { useState, useEffect, useCallback } from 'react';
import { Volume2, Mic, RefreshCw, Sparkles, ArrowRight, HelpCircle } from 'lucide-react';
import { weeklyWords } from './data/words';

function App() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        const currentWord = weeklyWords[currentWordIndex].word.toLowerCase();
        
        if (transcript.includes(currentWord)) {
          setFeedback("Wonderful Shelly! 🌟");
        } else {
          setFeedback("Let's try that again!");
          speak(weeklyWords[currentWordIndex].word);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      setRecognition(recognition);
    }
  }, [currentWordIndex]);

  const getPreferredVoice = useCallback(() => {
    const voices = window.speechSynthesis.getVoices();
    
    // Try to find specific American voices in order of preference
    const preferredVoices = [
      'Google US English',
      'Samantha',
      'Alex'
    ];
    
    // First try to find one of our preferred voices
    for (const preferredVoice of preferredVoices) {
      const voice = voices.find(v => v.name === preferredVoice);
      if (voice) return voice;
    }
    
    // If no preferred voice found, try to find any US English voice
    const usVoice = voices.find(voice => 
      voice.lang.includes('en-US') && 
      (voice.name.includes('female') || voice.name.includes('Female'))
    );
    
    return usVoice || voices.find(voice => voice.lang.includes('en-US')) || voices[0];
  }, []);

  const speak = useCallback((text: string) => {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    utterance.pitch = 1;
    utterance.lang = 'en-US';
    
    const voice = getPreferredVoice();
    if (voice) {
      utterance.voice = voice;
    }
    
    window.speechSynthesis.speak(utterance);
  }, [getPreferredVoice]);

  // Ensure voices are loaded
  useEffect(() => {
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.toLowerCase() === weeklyWords[currentWordIndex].word.toLowerCase()) {
      setFeedback("Good Job Shelly! 🎉");
      speak("Good Job Shelly!");
      
      if (currentWordIndex === weeklyWords.length - 1) {
        setIsComplete(true);
        speak("Great work Shelly!");
      }
    } else {
      setFeedback("Try again! 💪");
      speak("Try again!");
    }
  };

  const startListening = () => {
    if (recognition && !isListening) {
      try {
        recognition.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting recognition:', error);
        setIsListening(false);
      }
    }
  };

  const nextWord = () => {
    const nextIndex = (currentWordIndex + 1) % weeklyWords.length;
    setCurrentWordIndex(nextIndex);
    setInput('');
    setFeedback('');
    setShowHint(false);
    
    // Speak the new word
    setTimeout(() => {
      speak(weeklyWords[nextIndex].word);
    }, 300);
    
    if (nextIndex === weeklyWords.length - 1) {
      setIsComplete(true);
      speak("Great work Shelly!");
    }
  };

  const restartGame = () => {
    setCurrentWordIndex(0);
    setInput('');
    setFeedback('');
    setIsComplete(false);
    setShowHint(false);
    // Speak the first word when restarting
    setTimeout(() => {
      speak(weeklyWords[0].word);
    }, 300);
  };

  // Rest of the component remains the same...
  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <h1 className="text-3xl font-bold mb-6 text-purple-600">Great work Shelly! 🎉</h1>
          
          <div className="flex justify-center mb-8">
            <img 
              src="https://i.pinimg.com/736x/72/9d/0d/729d0defb6f08231fd7856df1271337c.jpg" 
              alt="Stitch celebrating" 
              className="w-64 h-64 object-contain"
            />
          </div>

          <button
            onClick={restartGame}
            className="flex items-center justify-center gap-2 mx-auto bg-purple-500 text-white py-3 px-6 rounded-lg hover:bg-purple-600 transition-colors"
          >
            <Sparkles className="w-5 h-5" />
            Play Again!
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-purple-600">Hi Shelly!</h1>
        
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={() => speak(weeklyWords[currentWordIndex].word)}
            className="p-3 bg-purple-100 rounded-full hover:bg-purple-200 transition-colors"
          >
            <Volume2 className="w-6 h-6 text-purple-600" />
          </button>
          
          <button
            onClick={() => setShowHint(!showHint)}
            className="flex items-center gap-2 p-3 bg-purple-100 rounded-full hover:bg-purple-200 transition-colors"
          >
            <HelpCircle className="w-6 h-6 text-purple-600" />
          </button>
        </div>

        {showHint && (
          <div className="text-center mb-6 p-3 bg-purple-50 rounded-lg border-2 border-purple-100">
            <p className="text-lg font-medium text-gray-600">
              {weeklyWords[currentWordIndex].hint}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type what you hear"
            className="w-full p-3 border-2 border-purple-200 rounded-lg focus:border-purple-400 focus:outline-none"
          />
          
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition-colors"
            >
              Check Spelling
            </button>
            
            <button
              type="button"
              onClick={nextWord}
              className="flex items-center gap-1 bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition-colors"
            >
              Next Word
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="flex justify-center mb-6">
          <button
            onClick={startListening}
            className={`p-4 rounded-full ${
              isListening ? 'bg-red-100 animate-pulse' : 'bg-gray-100 hover:bg-gray-200'
            } transition-colors`}
          >
            <Mic className={`w-6 h-6 ${isListening ? 'text-red-500' : 'text-gray-600'}`} />
          </button>
        </div>

        {feedback && (
          <div className="text-center text-lg font-medium text-purple-600 animate-bounce">
            {feedback}
          </div>
        )}

        <div className="flex justify-center mt-8">
          <img 
            src="https://i.pinimg.com/736x/72/9d/0d/729d0defb6f08231fd7856df1271337c.jpg" 
            alt="Stitch with hearts" 
            className="w-48 h-48 object-contain"
          />
        </div>
      </div>
    </div>
  );
}

export default App;