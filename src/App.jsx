import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Activity, 
  MapPin, 
  Shield, 
  Play, 
  Square, 
  AlertTriangle, 
  Mic, 
  Volume2, 
  Award, 
  Copy, 
  Check, 
  Sparkles, 
  Globe, 
  Navigation,
  Info,
  Printer,
  ChevronRight,
  Bookmark,
  FileText
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Hero from './components/Hero';
import { laws } from '../utils/mockLaws.js';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const localAssistantQuery = (userQuery, lang) => {
  const query = userQuery.toLowerCase();
  
  const responses = {
    en: {
      fines: `• **Section 112 (Overspeeding)**: Fine ranges from ₹1,000 to ₹2,000 for Light Motor Vehicles; ₹2,000 to ₹4,000 for Medium/Heavy Passenger vehicles.
• **Section 194B (Seatbelt)**: Penalty of ₹1,000.
• **Section 194D (Helmet)**: Penalty of ₹1,000 and driving license suspension for 3 months.
• **Section 185 (Drunken Driving)**: Fine of ₹10,000 and/or up to 6 months imprisonment.`,
      speed: `• **Expressways**: Maximum speed limit is 120 km/h.
• **National Highways**: Speed limit is 100 km/h for cars.
• **City Roads**: General speed limit is 50-60 km/h.
• **Section 112**: Mandatory compliance with all posted speed signs is required.`,
      helmet: `• **Section 129**: Protective headgear (helmet conforming to BIS standards) is mandatory for riders and pillions.
• **Section 194D**: Riding without a helmet incurs a ₹1,000 fine and 3-month license disqualification.`,
      license: `• **Section 3**: Driving a vehicle in public without a valid driving license is prohibited.
• **Section 181**: Driving without a license attracts a penalty of ₹5,000 and/or imprisonment.`,
      default: `Namaste! I am your Citizen e-Sahayak local assistant. I can guide you on:
• Traffic Fines & Penalties (under Motor Vehicles Act)
• Speed Limits (Highways, Expressways & Cities)
• Safety Compliance (Helmet & Seatbelt rules)
• Driving License requirements`
    },
    hi: {
      fines: `• **धारा 112 (तेज गति)**: हल्के मोटर वाहनों के लिए ₹1,000 से ₹2,000; मध्यम/भारी वाहनों के लिए ₹2,000 से ₹4,000 का जुर्माना।
• **धारा 194B (सीट बेल्ट)**: ₹1,000 का जुर्माना।
• **धारा 194D (हेलमेट)**: ₹1,000 का जुर्माना और 3 महीने के लिए ड्राइविंग लाइसेंस निलंबन।
• **धारा 185 (शराब पीकर गाड़ी चलाना)**: ₹10,000 का जुर्माना और/या 6 महीने तक की जेल।`,
      speed: `• **एक्सप्रेसवे**: अधिकतम गति सीमा 120 किमी/घंटा है।
• **राष्ट्रीय राजमार्ग**: कारों के लिए गति सीमा 100 किमी/घंटा है।
• **शहरी सड़कें**: सामान्य गति सीमा 50-60 किमी/घंटा है।
• **धारा 112**: सभी गति सीमाओं का पालन करना अनिवार्य है।`,
      helmet: `• **धारा 129**: दुपहिया वाहन चालकों और पीछे बैठने वालों के लिए बीआईएस मानकों के हेलमेट पहनना अनिवार्य है।
• **धारा 194D**: बिना हेलमेट गाड़ी चलाने पर ₹1,000 का जुर्माना और 3 महीने के लिए लाइसेंस निलंबन।`,
      license: `• **धारा 3**: सार्वजनिक स्थान पर बिना वैध ड्राइविंग लाइसेंस के गाड़ी चलाना प्रतिबंधित है।
• **धारा 181**: बिना लाइसेंस गाड़ी चलाने पर ₹5,000 का जुर्माना और/या जेल की सजा।`,
      default: `नमस्ते! मैं आपका नागरिक ई-सहायक स्थानीय सहायक हूं। मैं आपकी मदद कर सकता हूं:
• यातायात जुर्माने और दंड (मोटर वाहन अधिनियम के तहत)
• गति सीमाएं (राजमार्ग, एक्सप्रेसवे और शहर)
• सुरक्षा अनुपालन (हेलमेट और सीट बेल्ट नियम)
• ड्राइविंग लाइसेंस आवश्यकताएं`
    },
    ta: {
      fines: `• **பிரிவு 112 (அதிவேகம்)**: எல்.எம்.வி-க்கு ₹1,000 முதல் ₹2,000 வரை அபராதம்; நடுத்தர/கனரக வாகனங்களுக்கு ₹2,000 முதல் ₹4,000 வரை அபராதம்.
• **பிரிவு 194B (சீட் பெல்ட்)**: ₹1,000 அபராதம்.
• **பிரிவு 194D (தலைக்கவசம்)**: ₹1,000 அபராதம் மற்றும் 3 மாதங்களுக்கு ஓட்டுநர் உரிமம் இடைநீக்கம்.
• **பிரிவு 185 (மது அருந்திவிட்டு ஓட்டுதல்)**: ₹10,000 அபராதம் மற்றும்/அல்லது 6 மாத சிறைத்தண்டனை.`,
      speed: `• **விரைவுச்சாலைகள்**: அதிகபட்ச வேக வரம்பு மணிக்கு 120 கி.மீ.
• **தேசிய நெடுஞ்சாலைகள்**: கார்களுக்கு வேக வரம்பு மணிக்கு 100 கி.மீ.
• **நகர சாலைகள்**: வேக வரம்பு மணிக்கு 50-60 கி.மீ.
• **பிரிவு 112**: வேக வரம்புகளை பின்பற்றுவது கட்டாயமாகும்.`,
      helmet: `• **பிரிவு 129**: இருசக்கர வாகன ஓட்டுநர்கள் மற்றும் பின்னால் அமர்ந்திருப்பவர்கள் BIS தர முத்திரை பெற்ற தலைக்கவசம் அணிவது கட்டாயம்.
• **பிரிவு 194D**: ஹெல்மெட் அணியாமல் சென்றால் ₹1,000 அபராதம் மற்றும் 3 மாதங்கள் உரிமம் ரத்து.`,
      license: `• **பிரிவு 3**: முறையான ஓட்டுநர் உரிமம் இன்றி பொது இடத்தில் வாகனங்களை ஓட்டுவது தடைசெய்யப்பட்டுள்ளது.
• **பிரிவு 181**: உரிமம் இல்லாமல் வாகனங்களை ஓட்டினால் ₹5,000 அபராதம் மற்றும்/அல்லது சிறை.`,
      default: `வணக்கம்! நான் உங்கள் மின்-உதவியாளர் உள்ளூர் உதவியாளர். நான் உங்களுக்கு உதவ முடியும்:
• போக்குவரத்து அபராதங்கள் (மோட்டார் வாகன சட்டத்தின் கீழ்)
• வேக வரம்புகள் (நெடுஞ்சாலைகள் மற்றும் நகரங்கள்)
• பாதுகாப்பு விதிகள் (ஹெல்மெட் & சீட் பெல்ட்)
• ஓட்டுநர் உரிமம் தேவைகள்`
    },
    kn: {
      fines: `• **ವಿಭಾಗ 112 (ಅತಿವೇಗ)**: ಲಘು ವಾಹನಗಳಿಗೆ ₹1,000 ರಿಂದ ₹2,000; ಮಧ್ಯಮ/ಭಾರೀ ವಾಹನಗಳಿಗೆ ₹2,000 ರಿಂದ ₹4,000 ದಂಡ.
• **ವಿಭಾಗ 194B (ಸೀಟ್ ಬೆಲ್ಟ್)**: ₹1,000 ದಂಡ.
• **ವಿಭಾಗ 194D (ಹೆಲ್ಮೆಟ್)**: ₹1,000 ದಂಡ ಮತ್ತು 3 ತಿಂಗಳವರೆಗೆ ಚಾಲನಾ ಪರವಾನಗಿ ಅಮಾನತು.
• **ವಿಭಾಗ 185 (ಮದ್ಯಪಾನ ಮಾಡಿ ಚಾಲನೆ)**: ₹10,000 ದಂಡ ಮತ್ತು/ಅಥವಾ 6 ತಿಂಗಳವರೆಗೆ ಜೈಲು ಶಿಕ್ಷೆ.`,
      speed: `• **ಎಕ್ಸ್‌ಪ್ರೆಸ್‌ವೇಗಳು**: ಗರಿಷ್ಠ ವೇಗದ ಮಿತಿ ಗಂಟೆಗೆ 120 ಕಿ.மீ.
• **ರಾಷ್ಟ್ರೀಯ ಹೆದ್ದಾರಿಗಳು**: ಕಾರುಗಳಿಗೆ ವೇಗದ ಮಿತಿ ಗಂಟೆಗೆ 100 ಕಿ.மீ.
• **ನಗರ ರಸ್ತೆಗಳು**: ಸಾಮಾನ್ಯ ವೇಗದ ಮಿತಿ ಗಂಟೆಗೆ 50-60 ಕಿ.மீ.
• **ವಿಭಾಗ 112**: ನಿಗದಿತ ವೇಗ ಮಿತಿಗಳನ್ನು ಕಡ್ಡಾಯವಾಗಿ ಪಾಲಿಸಬೇಕು.`,
      helmet: `• **ವಿಭಾಗ 129**: ದ್ವಿಚಕ್ರ ವಾಹನ ಸವಾರರು ಮತ್ತು ಹಿಂಬದಿ ಸವಾರರು BIS ಮಾನದಂಡದ ಹೆಲ್ಮೆಟ್ ಧರಿಸುವುದು ಕಡ್ಡಾಯ.
• **ವಿಭಾಗ 194D**: ಹೆಲ್ಮೆಟ್ ರಹಿತ ಚಾಲನೆಗೆ ₹1,000 ದಂಡ ಮತ್ತು 3 ತಿಂಗಳ ಲೈಸೆನ್ಸ್ ಅಮಾನತು.`,
      license: `• **ವಿಭಾಗ 3**: ಚಾಲನಾ ಪರವಾನಗಿ ಇಲ್ಲದೆ ಸಾರ್ವಜನಿಕ ಸ್ಥಳದಲ್ಲಿ ವಾಹನ ಚಾಲನೆ ಮಾಡುವುದು ನಿಷೇಧಿಸಲಾಗಿದೆ.
• **ವಿಭಾಗ 181**: ಪರವಾನಗಿ ಇಲ್ಲದೆ ಚಾಲನೆ ಮಾಡಿದರೆ ₹5,000 ದಂಡ ಮತ್ತು/ಅಥವಾ ಜೈಲು ಶಿಕ್ಷೆ.`,
      default: `ನಮಸ್ತೆ! ನಾನು ನಿಮ್ಮ ನಾಗರಿಕ ಇ-ಸಹಾಯಕ್ ಸ್ಥಳೀಯ ಸಹಾಯಕಿ. ನಾನು ನಿಮಗೆ ಮಾರ್ಗದರ್ಶನ ನೀಡಬಲ್ಲೆ:
• ಸಂಚಾರ ದಂಡಗಳು (ಮೋಟಾರು ವಾಹನ ಕಾಯ್ದೆಯಡಿ)
• ವೇಗದ ಮಿತಿಗಳು (ಹೆದ್ದಾರಿಗಳು ಮತ್ತು ನಗರಗಳು)
• ಸುರಕ್ಷತಾ ನಿಯಮಗಳು (ಹೆಲ್ಮೆಟ್ ಮತ್ತು ಸೀಟ್ ಬೆಲ್ಟ್)
• ಚಾಲನಾ ಪರವಾನಗಿ ಅಗತ್ಯತೆಗಳು`
    }
  };

  const l = responses[lang] || responses.en;

  if (query.includes('fine') || query.includes('penalty') || query.includes('challan') || query.includes('सजा') || query.includes('जुर्माना') || query.includes('அபராதம்') || query.includes('ದಂಡ')) {
    return l.fines;
  }
  if (query.includes('speed') || query.includes('limit') || query.includes('गति') || query.includes('வேகம்') || query.includes('ವೇಗ')) {
    return l.speed;
  }
  if (query.includes('helmet') || query.includes('wear') || query.includes('हेलमेट') || query.includes('தலைக்கவசம்') || query.includes('ಹೆಲ್ಮೆಟ್')) {
    return l.helmet;
  }
  if (query.includes('license') || query.includes('licence') || query.includes('driving') || query.includes('लाइसेंस') || query.includes('உரிமம்') || query.includes('ಪರವಾನಗಿ')) {
    return l.license;
  }
  return l.default;
};

function MapUpdater({ position }) {
  const map = useMap();
  useEffect(() => { if (position) map.flyTo(position, 16, { duration: 1.5 }); }, [position, map]);
  return null;
}

export default function Satyaneev() {
  const [activeTab, setActiveTab] = useState('chat');
  const [location, setLocation] = useState(null);
  const [speed, setSpeed] = useState(0);
  const [alerts, setAlerts] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [speedLimit, setSpeedLimit] = useState(60);

  const [watchId, setWatchId] = useState(null);
  const [showViolationAlert, setShowViolationAlert] = useState(false);
  const [lastWarningTime, setLastWarningTime] = useState(0);



  // Regional Transport Office (RTO) Integration with mockLaws
  const [selectedRTO, setSelectedRTO] = useState('delhi');

  const [fontSize, setFontSize] = useState('normal'); // 'small', 'normal', 'large'

  // Reactive global font scaling
  useEffect(() => {
    const sizeMap = {
      small: '14px',
      normal: '16px',
      large: '19px'
    };
    document.documentElement.style.fontSize = sizeMap[fontSize] || '16px';
    return () => {
      document.documentElement.style.fontSize = '';
    };
  }, [fontSize]);

  // Certificate Claimant Name
  const [citizenName, setCitizenName] = useState('');
  const [isCertificateUnlocked, setIsCertificateUnlocked] = useState(false);
  const [certSerialNumber, setCertSerialNumber] = useState('');

  // Language
  const [lang, setLang] = useState('en');
  const languages = { en: 'English', hi: 'हिंदी', ta: 'தமிழ்', kn: 'ಕನ್ನಡ' };

  const t = (key) => {
    const translations = {
      en: {
        hero: "Know the law. Drive safe.",
        askAI: "Citizen e-Sahayak Desk",
        liveMonitor: "Vahan Speed Auditor",
        quiz: "Sarathi License Quiz",
        location: "RTO Registrar",
        driveLegalAI: "Citizen e-Sahayak",
        startMonitoring: "Initiate Speed Audit",
        stopMonitoring: "Terminate Speed Audit",
        enableLocation: "Enable GPS Registry",
        reset: "Reset Coordinates",
        noViolations: "No traffic speed violations registered",
        speedLimitLabel: "Designated Speed Limit",
        acquiringGPS: "Connecting to GIS Satellites...",
        startToSeeMap: "Initiate audit telemetry to display live GIS map",
      },
      hi: {
        hero: "कानून जानें। सुरक्षित ड्राइव करें।",
        askAI: "नागरिक ई-सहायक",
        liveMonitor: "वाहन गति लेखा परीक्षक",
        quiz: "सारथी लाइसेंस प्रश्नोत्तरी",
        location: "आरटीओ रजिस्ट्रार",
        driveLegalAI: "नागरिक ई-सहायक",
        startMonitoring: "गति लेखा परीक्षा शुरू करें",
        stopMonitoring: "गति लेखा परीक्षा बंद करें",
        enableLocation: "जीपीएस सक्षम करें",
        reset: "रीसेट करें",
        noViolations: "कोई गति उल्लंघन दर्ज नहीं किया गया",
        speedLimitLabel: "निर्धारित गति सीमा",
        acquiringGPS: "जीआईएस उपग्रहों से कनेक्ट कर रहे हैं...",
        startToSeeMap: "लाइव जीआईएस मानचित्र देखने के लिए लेखा परीक्षा शुरू करें",
      },
      ta: {
        hero: "சட்டத்தை அறிந்து கொள்ளுங்கள். பாதுகாப்பாக ஓட்டுங்கள்.",
        askAI: "மின்-உதவியாளர் மேசை",
        liveMonitor: "வாகன வேக ஆடிட்டர்",
        quiz: "சாரதி உரிம வினாடி வினா",
        location: "RTO பதிவாளர்",
        driveLegalAI: "மின்-உதவியாளர்",
        startMonitoring: "வேக தணிக்கையைத் தொடங்கு",
        stopMonitoring: "வேக தணிக்கையை நிறுத்து",
        enableLocation: "இருப்பிடத்தை இயக்கு",
        reset: "மீட்டமை",
        noViolations: "வேக மீறல்கள் எதுவும் கண்டறியப்படவில்லை",
        speedLimitLabel: "வேக வரம்பு",
        acquiringGPS: "GPS சிக்னலைப் பெறுகிறது...",
        startToSeeMap: "வரைபடத்தைப் பார்க்க தணிக்கையைத் தொடங்கவும்",
      },
      kn: {
        hero: "ಕಾನೂನು ತಿಳಿಯಿರಿ. ಸುರಕ್ಷಿತವಾಗಿ ಓಡಿಸಿ.",
        askAI: "ನಾಗರಿಕ ಇ-ಸಹಾಯಕ್",
        liveMonitor: "ವಾಹನ ವೇಗ ಲೆಕ್ಕಪರಿಶೋಧಕ",
        quiz: "ಸಾರಥಿ ಪರವಾನಗಿ ರಸಪ್ರಶ್ನೆ",
        location: "ಆರ್ಟಿಒ ರಿಜಿಸ್ಟ್ರಾರ್",
        driveLegalAI: "ನಾಗರಿಕ ಇ-ಸಹಾಯಕ್",
        startMonitoring: "ವೇಗ ಲೆಕ್ಕಪರಿಶೋಧನೆ ಪ್ರಾರಂಭಿಸಿ",
        stopMonitoring: "ವೇಗ ಲೆಕ್ಕಪರಿಶೋಧನೆ ನಿಲ್ಲಿಸಿ",
        enableLocation: "ಸ್ಥಳ ಸಕ್ರಿಯಗೊಳಿಸಿ",
        reset: "ಮರುಹೊಂದಿಸಿ",
        noViolations: "ಯಾವುದೇ ವೇಗದ ಉಲ್ಲಂಘನೆ ಕಂಡುಬಂದಿಲ್ಲ",
        speedLimitLabel: "ವೇಗದ ಮಿತಿ",
        acquiringGPS: "ಸಿಗ್ನಲ್ ಪಡೆಯಲಾಗುತ್ತಿದೆ...",
        startToSeeMap: "ನಕ್ಷೆ ನೋಡಲು ಲೆಕ್ಕಪರಿಶೋಧನೆ ಪ್ರಾರಂಭಿಸಿ",
      }
    };
    return translations[lang]?.[key] || translations.en[key];
  };
  // Chat
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Namaste! I am the Citizen e-Sahayak AI Desk of the Ministry of Road Transport and Highways. Ask me regarding the Motor Vehicles Act, RTO guidelines, speed regulations, or traffic fines." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const CHAT_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
  const CHAT_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent';
  const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';
  const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

  // Dynamic welcome message translation when language changes
  useEffect(() => {
    if (messages.length === 1 && messages[0].role === 'assistant') {
      const greetings = {
        en: "Namaste! I am the Citizen e-Sahayak AI Desk of the Ministry of Road Transport and Highways. Ask me regarding the Motor Vehicles Act, RTO guidelines, speed regulations, or traffic fines.",
        hi: "नमस्ते! मैं सड़क परिवहन और राजमार्ग मंत्रालय का नागरिक ई-सहायक एआई डेस्क हूं। मुझसे मोटर वाहन अधिनियम, आरटीओ दिशानिर्देशों, गति नियमों या यातायात जुर्मानों के बारे में पूछें।",
        ta: "வணக்கம்! நான் சாலை போக்குவரத்து மற்றும் நெடுஞ்சாலை அமைச்சகத்தின் மின்-உதவியாளர் மேசை. மோட்டார் வாகன சட்டம், ஆர்.டி.ஓ வழிகாட்டுதல்கள், வேக விதிமுறைகள் அல்லது போக்குவரத்து அபராதங்கள் பற்றி என்னிடம் கேளுங்கள்.",
        kn: "ನಮಸ್ತೆ! ನಾನು ರಸ್ತೆ ಸಾರಿಗೆ ಮತ್ತು ಹೆದ್ದಾರಿ ಸಚಿವಾಲಯದ ನಾಗರಿಕ ಇ-ಸಹಾಯಕ್ ಎಐ ಡೆಸ್ಕ್. ಮೋಟಾರು ವಾಹನ ಕಾಯ್ದೆ, ಆರ್ಟಿಒ ಮಾರ್ಗಸೂಚಿಗಳು, ವೇಗ ನಿಯಮಗಳು ಅಥವಾ ಸಂಚಾರ ದಂಡಗಳ ಬಗ್ಗೆ ನನ್ನನ್ನು ಕೇಳಿ."
      };
      setMessages([{ role: 'assistant', content: greetings[lang] || greetings.en }]);
    }
  }, [lang]);

  // Voice Input
  const [isListening, setIsListening] = useState(false);
  const recognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)
    ? new (window.SpeechRecognition || window.webkitSpeechRecognition)() : null;

  // Voice Output (Speech Synthesis)
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speak = (text) => {
    if (typeof window === 'undefined') return;
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'hi' ? 'hi-IN' : lang === 'ta' ? 'ta-IN' : lang === 'kn' ? 'kn-IN' : 'en-IN';
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (!recognition) return alert("Voice input not supported in this browser.");
    recognition.lang = lang === 'hi' ? 'hi-IN' : lang === 'ta' ? 'ta-IN' : lang === 'kn' ? 'kn-IN' : 'en-IN';
    recognition.onresult = (event) => {
      setInput(event.results[0][0].transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
    setIsListening(true);
  };
  // Quiz
  const [quizScore, setQuizScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  const quizQuestions = [
    { q: "What is the speed limit in most city areas?", a: "50 km/h", options: ["40 km/h", "50 km/h", "60 km/h"] },
    { q: "Which section deals with overspeeding fine?", a: "Section 112", options: ["Section 184", "Section 112", "Section 138"] },
    { q: "Fine for not wearing helmet under Motor Vehicles Act?", a: "₹1000", options: ["₹500", "₹1000", "₹2000"] },
  ];

  const checkAnswer = (option) => {
    setSelectedOption(option);
    const isCorrect = option === quizQuestions[currentQuestion].a;
    const currentScoreIncrement = isCorrect ? 1 : 0;
    
    if (isCorrect) {
      setQuizScore(prev => prev + 1);
    }
    setShowAnswer(true);
    
    setTimeout(() => {
      if (currentQuestion < quizQuestions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedOption(null);
        setShowAnswer(false);
      } else {
        const finalScore = quizScore + currentScoreIncrement;
        alert(`Quiz finished! Score: ${finalScore}/${quizQuestions.length}`);
        
        if (finalScore === quizQuestions.length) {
          setIsCertificateUnlocked(true);
          setCertSerialNumber(`MoRTH/DL/${Math.floor(100000 + Math.random() * 900000)}`);
        } else {
          setIsCertificateUnlocked(false);
          setCurrentQuestion(0);
          setQuizScore(0);
        }
        setSelectedOption(null);
        setShowAnswer(false);
      }
    }, 1500);
  };

  // Reset Quiz
  const resetQuiz = () => {
    setCurrentQuestion(0);
    setQuizScore(0);
    setIsCertificateUnlocked(false);
    setSelectedOption(null);
    setShowAnswer(false);
  };

  // Tabs
  const tabs = [
    { id: 'chat', label: t('askAI'), icon: MessageCircle, desc: "AI Citizen Helpdesk Portal" },
    { id: 'monitor', label: t('liveMonitor'), icon: Activity, desc: "GIS Speed Telemetry & RTO Auditor" },
    { id: 'quiz', label: t('quiz'), icon: Award, desc: "Citizen Road safety awareness test" },
    { id: 'location', label: t('location'), icon: MapPin, desc: "RTO Coordinate Audit Logger" },
  ];

  const heroSentences = [
    {
      parts: [{ text: 'Drive', italic: true }],
      parts2: [{ text: 'Legal', italic: true }],
    },
    {
      parts: [{ text: 'सुरक्षित', italic: false }],
      parts2: [{ text: 'सड़क', italic: false }],
    },
    {
      parts: [{ text: 'கண்ணியம்', italic: false }],
      parts2: [{ text: 'டிரைவிங்', italic: false }],
    },
    {
      parts: [{ text: 'ಕಾನೂನು', italic: false }],
      parts2: [{ text: 'ಚಾಲನೆ', italic: false }],
    },
  ];

  const handleHeroNavClick = (tabId) => {
    setActiveTab(tabId);
    const target = document.getElementById('content-area');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // RTO selector to adjust speed limit based on mockLaws.js
  useEffect(() => {
    if (laws.speed[selectedRTO]) {
      setSpeedLimit(laws.speed[selectedRTO]);
    }
  }, [selectedRTO]);
  // Geolocation watch cleanup effect
  useEffect(() => {
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [watchId]);
  // Helper to map coordinates to RTO locations (Delhi/Mumbai/Chennai)
  const detectCity = (lat, lng) => {
    // Delhi center ~ 28.61, 77.20
    const distToDelhi = Math.sqrt(Math.pow(lat - 28.6139, 2) + Math.pow(lng - 77.2090, 2));
    // Mumbai center ~ 19.07, 72.87
    const distToMumbai = Math.sqrt(Math.pow(lat - 19.0760, 2) + Math.pow(lng - 72.8777, 2));
    // Chennai center ~ 13.08, 80.27
    const distToChennai = Math.sqrt(Math.pow(lat - 13.0827, 2) + Math.pow(lng - 80.2707, 2));

    if (distToDelhi < 0.5) return 'delhi';
    if (distToMumbai < 0.5) return 'mumbai';
    if (distToChennai < 0.5) return 'chennai';
    return null;
  };

  // Helper to trigger overspeed signals (Vibration, Flash Alert, Voice Notice)
  const triggerSpeedWarning = (currentSpeed, limit) => {
    if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
    setShowViolationAlert(true);
    setTimeout(() => setShowViolationAlert(false), 4500);

    const voiceWarnings = {
      en: `Overspeeding warning! Your speed is ${currentSpeed} km/h. Local speed limit is ${limit} km/h. Please slow down immediately.`,
      hi: `गति सीमा चेतावनी! आपकी गति ${currentSpeed} किलोमीटर प्रति घंटा है। स्थानीय सीमा ${limit} है। कृपया तुरंत गति धीमी करें।`,
      ta: `வேக எச்சரிக்கை! உங்கள் வேகம் மணிக்கு ${currentSpeed} கிலோமீட்டர். அனுமதிக்கப்பட்ட வேகம் ${limit}. தயவுசெய்து வேகத்தை உடனடியாக குறைக்கவும்.`,
      kn: `ವೇಗದ ಎಚ್ಚರಿಕೆ! ನಿಮ್ಮ ವೇಗ ಗಂಟೆಗೆ ${currentSpeed} ಕಿಲೋಮೀಟರ್. ಸ್ಥಳೀಯ ಮಿತಿ ${limit}. ದಯವಿಟ್ಟು ವೇಗವನ್ನು ತಕ್ಷಣವೇ ಕಡಿಮೆ ಮಾಡಿ.`
    };
    speak(voiceWarnings[lang] || voiceWarnings.en);
  };

  // Monitoring GPS
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

            // Geofence city detection
            const detectedCity = detectCity(latitude, longitude);
            if (detectedCity && detectedCity !== selectedRTO) {
              setSelectedRTO(detectedCity);
              const systemMsg = `[System Audit] GPS matched regional boundary. Local RTO region updated to ${detectedCity.toUpperCase()} (Limit: ${laws.speed[detectedCity]} km/h).`;
              setAlerts((prev) => [systemMsg, ...prev].slice(0, 5));
            }

            setSpeed(kmh);
            setLocation(newLoc);

            if (kmh > speedLimit) {
              const msg = `[Overspeeding Alert] RTO Speed violation recorded: ${kmh} km/h (limit ${speedLimit} km/h). Section 112 applicable.`;
              setAlerts((prev) => [msg, ...prev].slice(0, 5));
              
              const nowTime = Date.now();
              if (nowTime - lastWarningTime > 8000) {
                setLastWarningTime(nowTime);
                triggerSpeedWarning(kmh, speedLimit);
              }
            }
          },
          (err) => {
            console.error("GPS Registry Error:", err);
            let errMsg = "GPS telemetry registry link failed.";
            if (err.code === 1) errMsg = "GPS permission denied by browser settings.";
            else if (err.code === 2) errMsg = "GPS hardware failed to secure satellite lock.";
            else if (err.code === 3) errMsg = "GPS satellite link request timed out.";
            setAlerts((prev) => [`[System Alert] ${errMsg}`, ...prev].slice(0, 5));
          },
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

  // Send Message to Chat API (OpenRouter with Gemini / Local FAQ Fallback)
  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const system = `You are Satyaneev AI, an official chatbot of the Ministry of Road Transport and Highways (MoRTH), Government of India. 
Respond in ${languages[lang]}.
Cite official rules of the Motor Vehicles Act (including the latest amendments/fines applicable in 2026).
Keep the tone highly professional, official, and authoritative, but helpful to citizens.
Format replies as:
- Quick rule highlights
- Clear penalties/fines under relevant Section/Clause numbers
- Maximum length 5 lines. No verbose introductory greetings.`;

    // 1. Try OpenRouter first if key is present
    if (OPENROUTER_API_KEY) {
      const openRouterModels = [
        'google/gemma-4-31b-it:free',
        'meta-llama/llama-3.3-70b-instruct:free',
        'meta-llama/llama-3.2-3b-instruct:free',
        'openrouter/free'
      ];
      
      for (const modelId of openRouterModels) {
        try {
          const res = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
              'HTTP-Referer': 'http://localhost:5173',
              'X-Title': 'Satyaneev'
            },
            body: JSON.stringify({
              model: modelId,
              messages: [
                { role: 'system', content: system },
                { role: 'user', content: input }
              ]
            })
          });
          const data = await res.json();
          const reply = data.choices?.[0]?.message?.content;
          if (reply) {
            setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
            setLoading(false);
            return;
          } else if (data.error) {
            console.warn(`OpenRouter model ${modelId} failed:`, data.error.message);
          }
        } catch (err) {
          console.warn(`OpenRouter fetch for ${modelId} failed:`, err);
        }
      }
    }

    // 2. Try Gemini if key is present and OpenRouter was not present or failed
    if (CHAT_API_KEY) {
      try {
        const res = await fetch(`${CHAT_API_URL}?key=${CHAT_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: `${system}\n\nUser: ${input}` }] }] }),
        });
        const data = await res.json();
        if (!data.error) {
          const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) {
            setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
            setLoading(false);
            return;
          }
        } else {
          console.warn("Gemini API error:", data.error.message);
        }
      } catch (err) {
        console.warn("Gemini fetch failed:", err);
      }
    }

    // 3. Smart local offline FAQ assistant fallback
    const offlineReply = localAssistantQuery(input, lang);
    setMessages(prev => [...prev, { role: 'assistant', content: offlineReply }]);
    setLoading(false);
  };

  // Bot response formatted rendering
  const renderMessageContent = (content) => {
    return content.split('\n').map((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('•') || trimmed.startsWith('*') || trimmed.startsWith('-')) {
        const text = trimmed.substring(1).trim();
        return (
          <div key={idx} className="flex items-start gap-2 my-1 ml-1 text-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-700 mt-2 shrink-0" />
            <span className="leading-relaxed text-sm sm:text-base">{text}</span>
          </div>
        );
      }
      if (/^\d+\./.test(trimmed)) {
        const match = trimmed.match(/^(\d+)\.(.*)/);
        const num = match[1];
        const text = match[2].trim();
        return (
          <div key={idx} className="flex items-start gap-2 my-1 ml-1 text-slate-700">
            <span className="font-semibold text-blue-900 shrink-0 min-w-[1.2rem]">{num}.</span>
            <span className="leading-relaxed text-sm sm:text-base">{text}</span>
          </div>
        );
      }
      return (
        <p key={idx} className="leading-relaxed my-1.5 text-slate-800 text-sm sm:text-base">
          {line}
        </p>
      );
    });
  };

  // Location Copy Coordinates state
  const [copied, setCopied] = useState(false);
  const copyCoordinates = () => {
    if (!location) return;
    navigator.clipboard.writeText(`${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 pb-16 md:pb-0 flex flex-col font-sans ${
      fontSize === 'small' ? 'text-xs' : fontSize === 'large' ? 'text-lg' : 'text-sm'
    }`}>
      
      {/* 1. National Tricolor Top Bar */}
      <div className="tricolor-bar no-print" />

      {/* 2. Top Accessibility Ribbon */}
      <div className="bg-slate-900 text-slate-300 text-[10px] sm:text-xs py-1.5 px-4 sm:px-10 flex justify-between items-center no-print">
        <div className="flex items-center gap-4">
          <span className="font-semibold tracking-wide">GOVERNMENT OF INDIA • भारत सरकार</span>
          <span className="hidden md:inline text-slate-500">|</span>
          <span className="hidden md:inline font-medium">Ministry of Road Transport & Highways</span>
        </div>
        <div className="flex items-center gap-4">
          {/* Font sizing buttons */}
          <div className="flex items-center gap-1.5">
            <button onClick={() => setFontSize('small')} className={`px-2 py-0.5 rounded border text-[9px] transition-colors ${fontSize === 'small' ? 'bg-saffron text-slate-950 font-bold border-saffron' : 'border-slate-700 hover:bg-slate-800'}`}>A-</button>
            <button onClick={() => setFontSize('normal')} className={`px-2 py-0.5 rounded border text-[9px] transition-colors ${fontSize === 'normal' ? 'bg-white text-slate-950 font-bold border-white' : 'border-slate-700 hover:bg-slate-800'}`}>A</button>
            <button onClick={() => setFontSize('large')} className={`px-2 py-0.5 rounded border text-[9px] transition-colors ${fontSize === 'large' ? 'bg-green text-slate-950 font-bold border-green' : 'border-slate-700 hover:bg-slate-800'}`}>A+</button>
          </div>
          
          <span className="text-slate-700 hidden sm:inline">|</span>

          {/* Language Selector Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded px-2 py-0.5">
            <Globe className="w-3.5 h-3.5 text-saffron shrink-0" />
            <select 
              value={lang} 
              onChange={e => setLang(e.target.value)} 
              className="bg-transparent text-[10px] text-slate-200 border-none outline-none cursor-pointer font-bold focus:ring-0"
            >
              {Object.entries(languages).map(([code, name]) => (
                <option key={code} value={code} className="text-slate-900 bg-white">{name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. Official Bilingual Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-4 sm:px-10 shadow-sm no-print">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Sarnath Lion Emblem and Ministry Title */}
          <div className="flex items-center gap-4 text-center md:text-left">
            {/* emblem SVG */}
            <svg className="w-12 h-16 text-slate-800 shrink-0" viewBox="0 0 100 130" fill="currentColor">
              {/* Sarnath Capital drawing */}
              <path d="M50 12 C44 12, 38 16, 36 22 L34 32 C34 40, 36 46, 40 48 L40 50 C36 50, 32 54, 32 60 L32 72 L68 72 L68 60 C68 54, 64 50, 60 50 L60 48 C64 46, 66 40, 66 32 L64 22 C62 16, 56 12, 50 12 Z" fill="none" stroke="currentColor" strokeWidth="2.5"/>
              <path d="M44 26 C44 24, 46 22, 50 22 C54 22, 56 24, 56 26 L56 38 C56 42, 54 44, 50 44 C46 44, 44 42, 44 38 Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="1.5,1.5"/>
              {/* pedestal */}
              <rect x="25" y="72" width="50" height="15" rx="2" fill="none" stroke="currentColor" strokeWidth="2.5"/>
              <circle cx="50" cy="79.5" r="5" fill="none" stroke="currentColor" strokeWidth="2"/>
              {/* Ashoka Wheel spokes */}
              <circle cx="50" cy="79.5" r="1.5" fill="currentColor"/>
              <line x1="50" y1="74.5" x2="50" y2="84.5" stroke="currentColor" strokeWidth="0.8"/>
              <line x1="45" y1="79.5" x2="55" y2="79.5" stroke="currentColor" strokeWidth="0.8"/>
              {/* Satyameva Jayate Devnagari text */}
              <text x="50" y="104" textAnchor="middle" fontSize="11" fontWeight="bold" fontFamily="serif" letterSpacing="0.4">सत्यमेव जयते</text>
              <text x="50" y="118" textAnchor="middle" fontSize="8" fontWeight="bold" tracking="wide">SATYAMEV JAYATE</text>
            </svg>
            <div>
              <div className="text-sm font-bold text-slate-800 tracking-wide">सड़क परिवहन और राजमार्ग मंत्रालय</div>
              <div className="text-lg font-black text-blue-950 leading-tight uppercase tracking-tight">Ministry of Road Transport & Highways</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Government of India • भारत सरकार</div>
            </div>
          </div>

          {/* Right Logo (mParivahan style badge / RTO auditor seal) */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end text-right hidden sm:block">
              <span className="text-[11px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded uppercase tracking-wider">
                Digital India initiative
              </span>
              <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded uppercase tracking-wider mt-1.5 flex items-center gap-1">
                ⚠️ Caution: Do not use while driving
              </span>
            </div>
            
            {/* National emblem seal */}
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-blue-900/30 flex items-center justify-center bg-blue-50 text-blue-900">
              <Shield className="w-6 h-6" />
            </div>
          </div>

        </div>
      </header>

      {/* 4. Marquee Alert Banner */}
      <div className="marquee-container no-print">
        <span className="marquee-label">NOTICES / नवीनतम सूचना</span>
        <div className="marquee-text">
          ⚠️ NATIONAL ROAD SAFETY: Overspeeding is a punishable offence under Section 112 of the Motor Vehicles Act. Fines vary from ₹1,000 to ₹4,000. | हेलमेट पहनना और सीटबेल्ट लगाना धारा 194बी के तहत कानूनन अनिवार्य है। | RTO speed audits are now fully automated via GPS registrar. | AI Citizen e-Sahayak Desk is online for citizen support. | 
        </div>
      </div>

      {/* 5. Hero Banner */}
      <div className="no-print">
        <Hero sentences={heroSentences} />
      </div>

      {/* 6. Citizen Services Navigation Tabs Grid */}
      <div className="bg-slate-100 border-b border-slate-200 py-6 px-4 sm:px-10 no-print">
        <div className="max-w-6xl mx-auto">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">CITIZEN INFORMATICS SERVICES / नागरिक सूचना सेवाएं</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleHeroNavClick(tab.id)}
                  className={`gov-card p-5 text-left transition-all ${
                    isActive 
                      ? 'border-l-4 border-l-saffron border-t border-r border-b border-slate-200 bg-white shadow-md' 
                      : 'bg-white hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <div className={`p-2.5 rounded-lg ${isActive ? 'bg-saffron/15 text-slate-900' : 'bg-slate-100 text-slate-500'}`}>
                      <IconComponent className="w-5.5 h-5.5" />
                    </div>
                    {isActive && <span className="text-[10px] font-bold text-saffron uppercase tracking-wider">Active Service</span>}
                  </div>
                  <div className="font-bold text-blue-950 text-sm tracking-wide">{tab.label}</div>
                  <div className="text-[11px] text-slate-400 mt-1">{tab.desc}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 7. Portal Content Area */}
      <div id="content-area" className="max-w-6xl mx-auto w-full px-4 sm:px-8 pb-16 pt-8 flex-1">
        
        {activeTab === 'chat' && (
          <div className="max-w-3xl mx-auto animate-fadeIn no-print">
            <div className="gov-card relative">
              
              {/* Voice Typing Overlay */}
              {isListening && (
                <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs flex flex-col items-center justify-center text-white z-20 p-6 text-center animate-fadeIn rounded-xl">
                  <div className="w-18 h-18 rounded-full bg-red-600/10 border-2 border-red-500 flex items-center justify-center mb-5 animate-pulse shadow-lg shadow-red-950/20">
                    <Mic className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-base font-bold tracking-wide uppercase text-white">
                    {lang === 'hi' ? 'सुन रहे हैं...' : lang === 'ta' ? 'கேட்கிறது...' : lang === 'kn' ? 'ಆಲಿಸುತ್ತಿದೆ...' : 'Listening...'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 max-w-xs leading-relaxed">
                    Speak now in <strong>{languages[lang]}</strong>. Your voice input is transcribing...
                  </p>
                  
                  {/* Wave Visualizers */}
                  <div className="flex gap-1.5 justify-center items-center mt-5 h-8">
                    <span className="w-1 h-4 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <span className="w-1 h-7 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <span className="w-1 h-5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                    <span className="w-1 h-8 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                    <span className="w-1 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
                  </div>
                  
                  <button 
                    onClick={() => {
                      if (recognition) recognition.stop();
                      setIsListening(false);
                    }}
                    className="mt-6 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}              
              {/* Government Header Banner */}
              <div className="gov-card-header px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#138808]" /> 
                  <div className="text-sm font-bold tracking-wide uppercase">{t('driveLegalAI')}</div>
                </div>
                <button 
                  onClick={() => {
                    const lastMsg = messages[messages.length - 1]?.content || '';
                    speak(lastMsg);
                  }} 
                  className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${isSpeaking ? 'text-saffron' : 'text-slate-300 hover:text-white'}`}
                  title="Speak response"
                >
                  <Volume2 size={18} />
                </button>
              </div>

              {/* Chat Log container */}
              <div className="h-[400px] overflow-y-auto p-6 space-y-4 bg-slate-50/50">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div 
                      className={`max-w-[85%] px-5 py-3.5 rounded-xl shadow-sm ${
                        msg.role === 'user' 
                          ? 'bg-blue-900 text-white rounded-tr-none font-medium' 
                          : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none relative'
                      }`}
                    >
                      {msg.role === 'user' ? (
                        <p className="text-sm sm:text-base leading-relaxed">{msg.content}</p>
                      ) : (
                        <div>
                          {renderMessageContent(msg.content)}
                          {/* Official seal footer in assistant bubble */}
                          <div className="mt-3.5 border-t border-slate-100 pt-2 flex items-center justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                            <span>Gateway: NIC-MoRTH-AI</span>
                            <span className="text-green-700 font-extrabold flex items-center gap-1">
                              <Check size={10} /> Certified Query
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {loading && (
                  <div className="flex items-center gap-2 text-slate-500 text-sm ml-2">
                    <Sparkles className="w-4 h-4 animate-spin text-saffron" />
                    <span className="font-semibold text-xs tracking-wider">Querying Ministry Database...</span>
                  </div>
                )}
              </div>

              {/* Chat Input Controls */}
              <div className="p-4 border-t bg-white border-slate-200 flex gap-2 items-center">
                <button 
                  onClick={startListening} 
                  className={`p-3 rounded-lg border transition-all ${
                    isListening 
                      ? 'border-red-500 bg-red-50 text-red-500 animate-pulse shadow-sm' 
                      : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
                  }`}
                  title="Voice Command"
                >
                  <Mic size={18} />
                </button>
                
                <input 
                  value={input} 
                  onChange={e => setInput(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && sendMessage()} 
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-900/50 transition-colors" 
                  placeholder="Ask regarding speed limits, challan amounts, rules..." 
                />
                
                <button 
                  onClick={sendMessage} 
                  className="px-6 py-3 bg-blue-950 hover:bg-blue-900 text-white rounded-lg text-sm font-bold shadow transition-colors"
                >
                  Submit Query
                </button>
              </div>

            </div>
          </div>
        )}

        {/* LIVE MONITOR TAB */}
        {activeTab === 'monitor' && (
          <div className="max-w-4xl mx-auto animate-fadeIn no-print">
            <div className="gov-card p-6 sm:p-8">
              
              {/* Title Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5 mb-6">
                <div>
                  <div className="text-xl font-black text-blue-950 uppercase tracking-tight">{t('liveMonitor')}</div>
                  <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-ping" />
                    Government Telemetry Audit System (Vahan-Audit)
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={toggleMonitoring}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${
                      isMonitoring 
                        ? 'bg-red-600 hover:bg-red-700 text-white shadow' 
                        : 'bg-green-700 hover:bg-green-800 text-white shadow'
                    }`}
                  >
                    {isMonitoring ? <Square size={14} /> : <Play size={14} />} 
                    {isMonitoring ? t('stopMonitoring') : t('startMonitoring')}
                  </button>
                </div>
              </div>

              {/* Simulated overspeed overlay alert */}
              {showViolationAlert && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-slate-900/50 backdrop-blur-xs">
                  <div className="bg-white border-2 border-red-500 p-8 rounded-2xl shadow-2xl text-center max-w-sm mx-4">
                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-100 text-red-600 mx-auto mb-4">
                      <AlertTriangle size={28} className="animate-pulse" />
                    </div>
                    <div className="text-xl font-black text-red-600 tracking-tight">SPEED COMPLIANCE VIOLATION</div>
                    <p className="text-slate-500 text-xs mt-2 mb-4 leading-relaxed">
                      Vehicle speed logged above the legal limit. Registered speed: <strong>{speed} km/h</strong> (limit {speedLimit} km/h). Section 112 infraction reported.
                    </p>
                    <button 
                      onClick={() => setShowViolationAlert(false)} 
                      className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg uppercase"
                    >
                      Acknowledge Violation
                    </button>
                  </div>
                </div>
              )}

              {/* Speeds panels grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
                
                {/* Telemetry speedometer */}
                <div className="md:col-span-6 flex flex-col items-center justify-center bg-slate-50 border border-slate-200 rounded-2xl p-6 relative">
                  <div className="w-52 h-52 rounded-full border-4 border-slate-200 bg-white flex flex-col justify-center items-center relative shadow-inner">
                    <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">RTO TELEMETRY</div>
                    <div className="text-6xl speed-text text-blue-950 font-black leading-none">{speed}</div>
                    <div className="text-[10px] uppercase font-bold tracking-wider text-green-700 mt-2">km/h</div>
                  </div>

                  <div className="flex items-center gap-1.5 mt-4 text-xs text-slate-500 font-bold bg-white px-3.5 py-1.5 rounded-lg border border-slate-200 uppercase tracking-wider">
                    <div className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-green-600 animate-ping' : 'bg-red-600'}`} />
                    <span>{isMonitoring ? 'Audit Active' : 'Auditor Offline'}</span>
                  </div>
                </div>
                {/* Speed Limits Audit Panel */}
                <div className="md:col-span-6 flex flex-col justify-center gap-4">
                  {/* Speed Limit info box */}
                  <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <div>
                      <div className="text-sm font-bold text-slate-700 uppercase tracking-widest">{t('speedLimitLabel')}</div>
                      <div className="text-slate-400 text-xs mt-1 font-semibold">Under Section 112 of Motor Vehicles Act</div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-2.5 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded inline-block">
                        Zone Rules Audited
                      </div>
                    </div>
                    
                    {/* Speed sign representation */}
                    <div className="w-20 h-20 rounded-full border-8 border-red-600 bg-white text-zinc-950 flex items-center justify-center font-black text-2xl shadow-md shrink-0">
                      {speedLimit}
                    </div>
                  </div>
                </div>              </div>

              {/* Map wrapper */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm relative h-[360px] bg-slate-100 mb-8">
                {location ? (
                  <MapContainer center={[location.lat, location.lng]} zoom={16} className="h-full w-full">
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[location.lat, location.lng]} />
                    <MapUpdater position={[location.lat, location.lng]} />
                  </MapContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-50">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-4 text-blue-950 shadow-sm">
                      <Navigation className="w-6 h-6 animate-pulse" />
                    </div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider max-w-xs leading-relaxed">
                      {isMonitoring ? t('acquiringGPS') : t('startToSeeMap')}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Speed Violation Ledger</div>
                {alerts.length > 0 ? (
                  alerts.map((a, i) => (
                    <div key={i} className="flex gap-3 bg-red-50 border border-red-200 px-5 py-3 rounded-lg text-xs sm:text-sm text-red-700 items-center">
                      <AlertTriangle size={16} className="shrink-0 text-red-600" /> 
                      <span className="font-semibold">{a}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-slate-400 py-6 border border-dashed border-slate-200 rounded-xl text-xs uppercase tracking-wider font-semibold">
                    {t('noViolations')}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* QUIZ TAB */}
        {activeTab === 'quiz' && (
          <div className="max-w-2xl mx-auto animate-fadeIn">
            
            {/* If Quiz is NOT complete/unlocked, show quiz UI */}
            {!isCertificateUnlocked ? (
              <div className="gov-card p-6 sm:p-8 no-print">
                
                {/* Header */}
                <div className="text-xl font-black text-blue-950 uppercase tracking-tight mb-5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-950 shadow-sm">
                    <Award size={18} />
                  </div>
                  <span>Citizen Driving Awareness Test</span>
                </div>

                {/* Progress bar */}
                <div className="mb-6 space-y-2">
                  <div className="flex justify-between text-xs text-slate-500 font-semibold uppercase">
                    <span>Question {currentQuestion + 1} of {quizQuestions.length}</span>
                    <span>Progress: {Math.round(((currentQuestion) / quizQuestions.length) * 100)}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div 
                      className="h-full bg-green-700 transition-all duration-300"
                      style={{ width: `${((currentQuestion) / quizQuestions.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Quiz question box */}
                <div className="mb-8">
                  <div className="text-lg font-bold text-slate-800 mb-5 leading-snug">{quizQuestions[currentQuestion].q}</div>
                  <div className="space-y-3">
                    {quizQuestions[currentQuestion].options.map((opt, i) => {
                      let btnClass = "w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 p-4 rounded-xl text-left transition-all duration-150 text-sm sm:text-base font-semibold shadow-sm";
                      if (showAnswer) {
                        if (opt === quizQuestions[currentQuestion].a) {
                          btnClass = "w-full bg-green-50 border-2 border-green-700 text-green-800 p-4 rounded-xl text-left transition-all duration-150 text-sm sm:text-base font-bold shadow-sm";
                        } else if (opt === selectedOption) {
                          btnClass = "w-full bg-red-50 border-2 border-red-500 text-red-700 p-4 rounded-xl text-left transition-all duration-150 text-sm sm:text-base font-bold shadow-sm";
                        } else {
                          btnClass = "w-full bg-slate-50 border border-slate-200 text-slate-400 p-4 rounded-xl text-left transition-all duration-150 text-sm sm:text-base cursor-not-allowed shadow-none";
                        }
                      }
                      return (
                        <button 
                          key={i} 
                          onClick={() => checkAnswer(opt)} 
                          disabled={showAnswer} 
                          className={btnClass}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Score Display footer */}
                <div className="text-center pt-4 border-t border-slate-200 text-xs text-slate-400 font-bold uppercase tracking-wider">
                  Test Score: <span className="text-blue-950 font-black">{quizScore}</span> / {quizQuestions.length}
                </div>

              </div>
            ) : (
              /* If Quiz is complete, show custom printable e-Certificate */
              <div className="space-y-6">
                
                {/* Claimant configuration panel */}
                <div className="gov-card p-6 no-print">
                  <h3 className="text-base font-black text-blue-950 uppercase tracking-tight mb-3">Claim Road Safety Awareness e-Certificate</h3>
                  <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                    Congratulations! You scored 100% on the Road Safety Awareness Exam. Enter your name below to generate your official Ministry road safety certificate.
                  </p>
                  
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={citizenName}
                      onChange={(e) => setCitizenName(e.target.value)}
                      placeholder="Enter Full Name"
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 font-semibold focus:outline-none focus:border-blue-900"
                    />
                    <button 
                      onClick={() => window.print()}
                      disabled={!citizenName}
                      className="px-6 py-2.5 bg-blue-950 hover:bg-blue-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Printer size={14} /> Print / Save
                    </button>
                    <button
                      onClick={resetQuiz}
                      className="px-4 py-2.5 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg uppercase hover:bg-slate-50"
                    >
                      Retake Test
                    </button>
                  </div>
                </div>

                {/* Official Certificate Layout */}
                <div className="print-certificate-only certificate-frame rounded-2xl relative shadow-md overflow-hidden">
                  <div className="certificate-watermark" />
                  
                  {/* Gold border decorative corners */}
                  <div className="absolute top-4 left-4 text-slate-400 text-xs font-bold uppercase">MoRTH / NRSC</div>
                  <div className="absolute top-4 right-4 text-slate-400 text-xs font-bold">{certSerialNumber}</div>

                  <div className="text-center py-6">
                    {/* Emblem */}
                    <svg className="w-12 h-14 mx-auto text-slate-800 mb-4" viewBox="0 0 100 130" fill="currentColor">
                      <path d="M50 12 C44 12, 38 16, 36 22 L34 32 C34 40, 36 46, 40 48 L40 50 C36 50, 32 54, 32 60 L32 72 L68 72 L68 60 C68 54, 64 50, 60 50 L60 48 C64 46, 66 40, 66 32 L64 22 C62 16, 56 12, 50 12 Z" fill="none" stroke="currentColor" strokeWidth="2.5"/>
                      <rect x="25" y="72" width="50" height="15" rx="2" fill="none" stroke="currentColor" strokeWidth="2.5"/>
                      <circle cx="50" cy="79.5" r="5" fill="none" stroke="currentColor" strokeWidth="2"/>
                      <text x="50" y="104" textAnchor="middle" fontSize="11" fontWeight="bold" fontFamily="serif">सत्यमेव जयते</text>
                    </svg>

                    <h1 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">National Road Safety Council</h1>
                    <h2 className="text-xl font-black text-blue-950 uppercase tracking-tight leading-tight mt-1">Ministry of Road Transport & Highways</h2>
                    <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Government of India</h3>
                    
                    <div className="w-48 h-0.5 bg-gradient-to-r from-saffron via-slate-300 to-green mx-auto my-6" />

                    <h4 className="font-serif italic text-lg text-slate-600">Road Safety Awareness Certificate</h4>
                    
                    <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed mt-4">
                      This is to certify that the citizen
                    </p>
                    
                    {/* Citizen name printed */}
                    <div className="text-2xl font-bold text-blue-950 py-4 font-serif border-b border-dashed border-slate-200 max-w-sm mx-auto min-h-[3rem]">
                      {citizenName || "________________________"}
                    </div>

                    <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed mt-4">
                      has successfully passed the road rules and traffic awareness assessments, demonstrating complete understanding of the <strong>Motor Vehicles Amendment Act</strong> speed, helmet, and safety regulations.
                    </p>

                    <div className="grid grid-cols-2 gap-8 mt-12 max-w-md mx-auto items-end">
                      <div className="text-left">
                        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Date of Issue</div>
                        <div className="text-xs font-semibold text-slate-800 mt-1">{new Date().toLocaleDateString('en-IN', {day: 'numeric', month: 'long', year: 'numeric'})}</div>
                      </div>
                      
                      <div className="text-right">
                        {/* Seal badge */}
                        <div className="gov-stamp mx-auto shrink-0 mb-1 border-green-600 text-green-700 bg-green-50/50">
                          APPROVED NRSC
                        </div>
                        <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Director, NRSC Audit</div>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            )}

          </div>
        )}

        {/* LOCATION TAB */}
        {activeTab === 'location' && (
          <div className="max-w-md mx-auto text-center gov-card p-8 sm:p-10 animate-fadeIn no-print">
            
            <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-100 text-blue-950 flex items-center justify-center mx-auto mb-6">
              <MapPin size={28} />
            </div>

            {!location ? (
              <div className="space-y-4">
                <h3 className="text-lg font-black text-blue-950 uppercase tracking-tight">RTO Telemetry GPS Registry</h3>
                <p className="text-slate-500 text-xs leading-relaxed mb-6">
                  Authorize location permissions to log compliance telemetry data locally via GPS.
                </p>
                <button 
                  onClick={() => navigator.geolocation.getCurrentPosition(p => 
                    setLocation({ lat: p.coords.latitude, lng: p.coords.longitude })
                  )} 
                  className="px-8 py-3 bg-blue-950 hover:bg-blue-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow"
                >
                  {t('enableLocation')}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Official Telemetry Registry Log</div>
                  
                  {/* Digital readout coordinates design */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 font-mono space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Latitude</span>
                      <span className="text-xl font-bold tracking-tight text-slate-800">{location.lat.toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Longitude</span>
                      <span className="text-xl font-bold tracking-tight text-slate-500">{location.lng.toFixed(6)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 justify-center">
                  <button 
                    onClick={copyCoordinates}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
                  >
                    {copied ? (
                      <>
                        <Check size={14} className="text-green-700" />
                        <span className="text-green-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Copy Coordinates</span>
                      </>
                    )}
                  </button>

                  <button 
                    onClick={() => setLocation(null)} 
                    className="flex-1 px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-bold uppercase hover:bg-red-100/50"
                  >
                    {t('reset')}
                  </button>
                </div>
              </div>
            )}
            
            <div className="mt-8 flex items-start gap-2 bg-slate-50 border border-slate-200 p-4 rounded-xl text-left">
              <Info size={16} className="text-blue-900 mt-0.5 shrink-0" />
              <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                IMPORTANT: Compliance coordinates are maintained strictly in-memory. They are not uploaded to national servers or shared with transport offices.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* 8. Sticky Bottom Tab Bar (Mobile screen sizes only) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 px-4 py-2.5 flex justify-around shadow-lg no-print">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleHeroNavClick(tab.id)}
              className={`flex flex-col items-center gap-1.5 py-1 px-3 rounded-lg text-slate-400 hover:text-blue-950 transition-colors ${isActive ? 'text-blue-950 font-bold' : ''}`}
            >
              <IconComponent className="w-5.5 h-5.5" />
              <span className="text-[9px] uppercase font-bold tracking-wider">{t(tab.id === 'chat' ? 'askAI' : tab.id === 'monitor' ? 'liveMonitor' : tab.id === 'quiz' ? 'quiz' : 'location')}</span>
            </button>
          );
        })}
      </div>

    </div>
  );
}
