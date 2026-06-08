import React, { useState, useEffect } from 'react';
import { MessageCircle, Activity, MapPin, Shield, Play, Square, AlertTriangle, Mic, Volume2, Award } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Hero from './components/Hero';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapUpdater({ position }) {
  const map = useMap();
  useEffect(() => { if (position) map.flyTo(position, 16, { duration: 1.5 }); }, [position, map]);
  return null;
}

export default function DriveLegal() {
  const [activeTab, setActiveTab] = useState('chat');
  const [location, setLocation] = useState(null);
  const [speed, setSpeed] = useState(0);
  const [alerts, setAlerts] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [speedLimit, setSpeedLimit] = useState(60);
  const [watchId, setWatchId] = useState(null);
  const [showViolationAlert, setShowViolationAlert] = useState(false);


  // Language
  const [lang, setLang] = useState('en');

  const languages = { en: 'English', hi: 'हिंदी', ta: 'தமிழ்', kn: 'ಕನ್ನಡ' };

  const t = (key) => {
    const translations = {
      en: {
        hero: "Know the law. Drive safe.",
        askAI: "Ask AI",
        liveMonitor: "Live Monitor",
        quiz: "Quiz",
        location: "Location",
        driveLegalAI: "DriveLegal AI",
        startMonitoring: "Start Monitoring",
        stopMonitoring: "Stop Monitoring",
        enableLocation: "Enable Location",
        reset: "Reset",
        noViolations: "No violations detected",
        speedLimitLabel: "Speed Limit",
        acquiringGPS: "Acquiring GPS signal...",
        startToSeeMap: "Start monitoring to see live map",
      },
      hi: {
        hero: "कानून जानें। सुरक्षित ड्राइव करें।",
        askAI: "AI से पूछें",
        liveMonitor: "लाइव मॉनिटर",
        quiz: "क्विज़",
        location: "स्थान",
        driveLegalAI: "DriveLegal AI",
        startMonitoring: "मॉनिटरिंग शुरू करें",
        stopMonitoring: "मॉनिटरिंग बंद करें",
        enableLocation: "स्थान सक्षम करें",
        reset: "रीसेट करें",
        noViolations: "कोई उल्लंघन नहीं मिला",
        speedLimitLabel: "गति सीमा",
        acquiringGPS: "GPS सिग्नल प्राप्त कर रहे हैं...",
        startToSeeMap: "मानचित्र देखने के लिए मॉनिटरिंग शुरू करें",
      },
      ta: {
        hero: "சட்டத்தை அறிந்து கொள்ளுங்கள். பாதுகாப்பாக ஓட்டுங்கள்.",
        askAI: "AI ஐ கேளுங்கள்",
        liveMonitor: "நேரடி கண்காணிப்பு",
        quiz: "வினாடி வினா",
        location: "இருப்பிடம்",
        driveLegalAI: "DriveLegal AI",
        startMonitoring: "கண்காணிப்பைத் தொடங்கு",
        stopMonitoring: "கண்காணிப்பை நிறுத்து",
        enableLocation: "இருப்பிடத்தை இயக்கு",
        reset: "மீட்டமை",
        noViolations: "எந்த மீறலும் இல்லை",
        speedLimitLabel: "வேக வரம்பு",
        acquiringGPS: "GPS சிக்னலைப் பெறுகிறது...",
        startToSeeMap: "வரைபடத்தைப் பார்க்க கண்காணிப்பைத் தொடங்கவும்",
      },
      kn: {
        hero: "ಕಾನೂನು ತಿಳಿಯಿರಿ. ಸುರಕ್ಷಿತವಾಗಿ ಓಡಿಸಿ.",
        askAI: "AI ಕೇಳಿ",
        liveMonitor: "ಲೈವ್ ಮಾನಿಟರ್",
        quiz: "ಕ್ವಿಜ್",
        location: "ಸ್ಥಳ",
        driveLegalAI: "DriveLegal AI",
        startMonitoring: "ಮಾನಿಟರಿಂಗ್ ಪ್ರಾರಂಭಿಸಿ",
        stopMonitoring: "ಮಾನಿಟರಿಂಗ್ ನಿಲ್ಲಿಸಿ",
        enableLocation: "ಸ್ಥಳ ಸಕ್ರಿಯಗೊಳಿಸಿ",
        reset: "ಮರುಹೊಂದಿಸಿ",
        noViolations: "ಯಾವುದೇ ಉಲ್ಲಂಘನೆ ಕಂಡುಬಂದಿಲ್ಲ",
        speedLimitLabel: "ವೇಗ ಮಿತಿ",
        acquiringGPS: "GPS ಸಿಗ್ನಲ್ ಪಡೆಯಲಾಗುತ್ತಿದೆ...",
        startToSeeMap: "ನಕ್ಷೆ ನೋಡಲು ಮಾನಿಟರಿಂಗ್ ಪ್ರಾರಂಭಿಸಿ",
      }
    };
    return translations[lang]?.[key] || translations.en[key];
  };

  // Chat
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm DriveLegal. Ask me about Indian traffic rules." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const CHAT_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
  const CHAT_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent';

  // Voice
  const [isListening, setIsListening] = useState(false);
  const recognition = window.SpeechRecognition || window.webkitSpeechRecognition 
    ? new (window.SpeechRecognition || window.webkitSpeechRecognition)() : null;

  const speak = (text) => {
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();   // stop if already speaking
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang === 'hi' ? 'hi-IN' : lang === 'ta' ? 'ta-IN' : lang === 'kn' ? 'kn-IN' : 'en-IN';
  window.speechSynthesis.speak(utterance);
};


  const startListening = () => {
    if (!recognition) return alert("Voice input not supported");
    recognition.lang = lang === 'hi' ? 'hi-IN' : lang === 'ta' ? 'ta-IN' : lang === 'kn' ? 'kn-IN' : 'en-IN';
    recognition.onresult = (event) => {
      setInput(event.results[0][0].transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.start();
    setIsListening(true);
  };

  // Quiz
  const [quizScore, setQuizScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const quizQuestions = [
    { q: "What is the speed limit in most city areas?", a: "50 km/h", options: ["40 km/h", "50 km/h", "60 km/h"] },
    { q: "Which section deals with overspeeding fine?", a: "Section 184", options: ["Section 184", "Section 112", "Section 138"] },
    { q: "Fine for not wearing helmet?", a: "₹1000", options: ["₹500", "₹1000", "₹2000"] },
  ];

  const checkAnswer = (option) => {
    if (option === quizQuestions[currentQuestion].a) setQuizScore(quizScore + 1);
    setShowAnswer(true);
    setTimeout(() => {
      if (currentQuestion < quizQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setShowAnswer(false);
      } else {
        alert(`Quiz finished! Score: ${quizScore + (option === quizQuestions[currentQuestion].a ? 1 : 0)}/${quizQuestions.length}`);

        setCurrentQuestion(0);
        setQuizScore(0);
        setShowAnswer(false);
      }
    }, 1200);
  };

  // Tabs
  const tabs = [
    { id: 'chat', label: 'Ask AI', icon: MessageCircle },
    { id: 'monitor', label: 'Live Monitor', icon: Activity },
    { id: 'quiz', label: 'Quiz', icon: Award },
    { id: 'location', label: 'Location', icon: MapPin },
  ];

  const heroSentences = [
    {
      parts: [{ text: 'Drive', italic: true }],
      parts2: [{ text: 'Legal', italic: true }],
    },
    {
      parts: [{ text: 'ड्राइव', italic: false }],
      parts2: [{ text: 'लीगल', italic: false }],
    },
    {
      parts: [{ text: 'டிரைவ்', italic: false }],
      parts2: [{ text: 'லீகல்', italic: false }],
    },
    {
      parts: [{ text: 'ಡ್ರೈವ್', italic: false }],
      parts2: [{ text: 'ಲೀಗಲ್', italic: false }],
    },
  ];

  const handleHeroNavClick = (tabId) => {
    setActiveTab(tabId);
    const target = document.getElementById('content-area');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Monitoring
  const toggleMonitoring = () => {
    if (!isMonitoring) {
      setAlerts([]);
      setSpeed(0);
      setLocation(null);

      if (navigator.geolocation) {
        const id = navigator.geolocation.watchPosition(
          (pos) => {
            const { latitude, longitude, speed: gpsSpeed } = pos.coords;
            const kmh = Math.round((gpsSpeed || 0) * 3.6);
            const newLoc = { lat: latitude, lng: longitude };

            setSpeed(kmh);
            setLocation(newLoc);

            if (kmh > speedLimit) {
  const msg = `Overspeeding! ${kmh} km/h (limit ${speedLimit})`;
  
  setAlerts((prev) => [msg, ...prev].slice(0, 5));
  if ('vibrate' in navigator) navigator.vibrate(200);

  // === NEW: Immediate big alert ===
  setShowViolationAlert(true);
  setTimeout(() => setShowViolationAlert(false), 4000);
}

          },
          console.error,
          { enableHighAccuracy: true }
        );
        setWatchId(id);
      }
    } else {
      if (watchId) navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsMonitoring(!isMonitoring);
  };

  // Send Message
  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const system = `You are DriveLegal. Answer in ${languages[lang]}. 
Use latest MV Act 2026. 
Be extremely concise (max 4-5 lines). 
Use short bullet points only. 
No long paragraphs. 
Mention Section/Rule clearly.`;

    try {
      const res = await fetch(`${CHAT_API_URL}?key=${CHAT_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: `${system}\n\nUser: ${input}` }] }] }),
      });
      const data = await res.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, try again.";
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Connection error." }]);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-transparent text-white">
      {/* Header */}
        <header className="site-header sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-10 py-6 flex items-center justify-between">
    
    {/* Logo */}
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center">
        <Shield className="w-7 h-7" />
      </div>
      <div>
        <div className="text-4xl font-semibold tracking-[-2.5px]">DriveLegal</div>
      </div>
    </div>

    {/* Language */}
      <div className="flex items-center gap-4">
      <select 
        value={lang} 
        onChange={e => setLang(e.target.value)} 
        className="bg-transparent border border-white/10 rounded-2xl px-4 py-2 text-sm text-white"
      >
        {Object.entries(languages).map(([code, name]) => (
          <option key={code} value={code} style={{ color: '#111827', backgroundColor: '#f8fafc' }}>{name}</option>
        ))}
      </select>
    </div>

  </div>
</header>

      {/* Hero */}
      <Hero sentences={heroSentences} />

      {/* Right vertical nav (section links) */}
      <div className="hidden md:flex fixed right-8 top-28 z-[70] vertical-nav text-slate-200">
        {tabs.map((tab) => {
          const label = t(
            tab.id === 'chat' ? 'askAI' :
            tab.id === 'monitor' ? 'liveMonitor' :
            tab.id === 'quiz' ? 'quiz' : 'location'
          );
          return (
            <button
              key={tab.id}
              onClick={() => handleHeroNavClick(tab.id)}
              className={`opacity-80 hover:opacity-100 text-right ${activeTab === tab.id ? 'text-white' : 'text-slate-200'}`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div id="content-area" className="max-w-6xl mx-auto px-8 pb-20">
        
        {/* CHAT TAB */}
        {activeTab === 'chat' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-[rgba(0,0,0,0.45)] border border-white/5 rounded-3xl overflow-hidden text-white">
              <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 bg-[var(--primary)] rounded-full animate-pulse" /> 
                  <div className="text-lg">{t('driveLegalAI')}</div>
                </div>
                <button 
  onClick={() => {
    const lastMsg = messages[messages.length - 1]?.content || '';
    speak(lastMsg);
  }} 
  className="text-white/90"
>

                  <Volume2 size={18} />
                </button>
              </div>

              <div className="h-[420px] overflow-auto p-8 space-y-4 text-[15px]">
                {messages.map((msg, i) => (
  <div key={i} className={msg.role === 'user' ? 'flex justify-end' : ''}>
    <div className={`max-w-[85%] px-6 py-4 rounded-3xl ${msg.role === 'user' ? 'bg-white text-black' : 'bg-[rgba(255,255,255,0.04)] text-white'}`}>
      {msg.content.split('\n').map((line, idx) => (
        <div key={idx} className="leading-snug">{line}</div>
      ))}
    </div>
  </div>
))}

                {loading && <div className="pl-2 text-slate-400">Thinking…</div>}
              </div>

              <div className="p-6 border-t flex gap-3 bg-[rgba(0,0,0,0.35)] border-t border-white/5">
                <button onClick={startListening} className={`px-4 ${isListening ? 'text-red-400' : 'text-white/90'}`}>
                  <Mic size={20} />
                </button>
                <input 
                  value={input} 
                  onChange={e => setInput(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && sendMessage()} 
                  className="flex-1 bg-[rgba(255,255,255,0.03)] border border-white/5 rounded-2xl px-6 py-4 text-sm text-white placeholder:text-white/50" 
                  placeholder="Ask anything..." 
                />
                <button onClick={sendMessage} className="px-10 py-3 btn-gradient text-white rounded-2xl font-semibold shadow-lg transition-shadow hover:shadow-xl">Send</button>
              </div>
            </div>
          </div>
        )}

        {/* LIVE MONITOR TAB */}
        {activeTab === 'monitor' && (
          <div className="max-w-4xl mx-auto bg-[rgba(0,0,0,0.45)] border border-white/5 rounded-3xl p-8 shadow-2xl text-white">
            <div className="flex justify-between items-center mb-6">
              <div>
                <div className="text-3xl font-semibold">{t('liveMonitor')}</div>
                <div className="text-primary text-sm">Real-time GPS + Speed Tracking</div>
              </div>
              <button
                onClick={toggleMonitoring}
                className={`flex items-center gap-2 px-7 py-3 rounded-2xl font-medium ${isMonitoring ? 'bg-red-500' : 'bg-gradient-to-br from-primary to-accent text-white shadow-md'}`}
              >
                {isMonitoring ? <Square size={18} /> : <Play size={18} />} 
                {isMonitoring ? t('stopMonitoring') : t('startMonitoring')}
              </button>
            </div>
            {showViolationAlert && (
  <div className="fixed inset-0 flex items-center justify-center z-[100] pointer-events-none">
    <div className="bg-red-600 text-white px-12 py-8 rounded-3xl shadow-2xl text-center animate-pulse pointer-events-auto">
      <div className="flex items-center justify-center gap-3 mb-2">
        <AlertTriangle size={40} />
        <div className="text-4xl font-bold">OVERSPEEDING!</div>
      </div>
      <div className="text-2xl">Slow down immediately</div>
    </div>
  </div>
)}


            <div className="flex justify-center gap-8 mb-6">
              <div className="text-center">
                <div className="text-[90px] font-semibold tabular-nums tracking-[-6px] leading-none">{speed}</div>
                <div className="text-2xl text-primary -mt-3">km/h</div>
              </div>
              <div className="text-center pt-4">
                <div className="text-sm text-slate-400">{t('speedLimitLabel')}</div>
                <div className="text-4xl font-semibold">{speedLimit} <span className="text-xl">km/h</span></div>
              </div>
            </div>

            <div className="h-[380px] rounded-2xl overflow-hidden border border-slate-200 mb-6">
              {location ? (
                <MapContainer center={[location.lat, location.lng]} zoom={16} className="h-full w-full">
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[location.lat, location.lng]} />
                  <MapUpdater position={[location.lat, location.lng]} />
                </MapContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 bg-white">
                  {isMonitoring ? t('acquiringGPS') : t('startToSeeMap')}
                </div>
              )}
            </div>

            <div className="space-y-2">
              {alerts.length > 0 ? (
                alerts.map((a, i) => (
                  <div key={i} className="flex gap-3 bg-red-950/40 border border-red-500/30 px-5 py-4 rounded-2xl text-sm">
                    <AlertTriangle size={18} className="mt-0.5" /> {a}
                  </div>
                ))
              ) : (
                <div className="text-center text-zinc-500 py-4">{t('noViolations')}</div>
              )}
            </div>
          </div>
        )}

        {/* QUIZ TAB */}
        {activeTab === 'quiz' && (
          <div className="max-w-md mx-auto bg-[rgba(0,0,0,0.45)] border border-white/5 rounded-3xl p-8 text-white">
            <div className="text-3xl font-semibold mb-6 flex items-center gap-3"><Award /> {t('quiz')}</div>
            <div className="mb-8">
              <div className="text-xl mb-4">{quizQuestions[currentQuestion].q}</div>
              <div className="space-y-3">
                {quizQuestions[currentQuestion].options.map((opt, i) => (
                  <button 
                    key={i} 
                    onClick={() => checkAnswer(opt)} 
                    disabled={showAnswer} 
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 p-4 rounded-2xl text-left"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-center text-sm text-slate-400">Score: {quizScore} / {quizQuestions.length}</div>
          </div>
        )}

        {/* LOCATION TAB */}
        {activeTab === 'location' && (
          <div className="max-w-md mx-auto text-center bg-[rgba(0,0,0,0.45)] border border-white/5 rounded-3xl p-10 shadow-2xl text-white">
            {!location ? (
              <button 
                onClick={() => navigator.geolocation.getCurrentPosition(p => 
                  setLocation({ lat: p.coords.latitude, lng: p.coords.longitude })
                )} 
                className="px-10 py-4 bg-gradient-to-br from-primary to-accent hover:from-primary/90 rounded-2xl text-lg font-semibold text-white shadow-md"
              >
                {t('enableLocation')}
              </button>
            ) : (
              <div>
                <div className="font-mono text-4xl tracking-tight">{location.lat.toFixed(5)}</div>
                <div className="font-mono text-4xl tracking-tight text-slate-400">{location.lng.toFixed(5)}</div>
                <button 
                  onClick={() => setLocation(null)} 
                  className="mt-8 text-sm text-slate-400 hover:text-slate-700"
                >
                  {t('reset')}
                </button>
              </div>
            )}
            <p className="text-xs text-zinc-500 mt-8">Google Maps ready — add your key for full map</p>
          </div>
        )}
      </div>

    </div>
  );
}

