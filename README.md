# Satyaneev (सत्यनीव) - Official Road Safety Telemetry Portal
*Ministry of Road Transport and Highways (MoRTH), Government of India*

Satyaneev is an official, interactive citizen portal designed to enforce speed compliance, educate motorists on the Motor Vehicles Act, and issue official Road Safety Awareness e-Certificates.

---

## 🏛️ Core Features

### 1. Vahan GPS Telemetry Speed Auditor
*   **Fully Automated Auditing**: Tracks driver coordinates and matches them against regional RTO boundaries.
*   **Dynamic Geofencing**: Automatically sets the speed limit based on location:
    *   **Delhi**: 60 km/h
    *   **Mumbai**: 50 km/h
    *   **Chennai**: 60 km/h
*   **Rider Alert signals**: Exceeding the local limit triggers:
    *   *Visual*: A large "SPEED COMPLIANCE VIOLATION" flash warning.
    *   *Haptic*: Rhythmic haptic vibration ticks.
    *   *Voice*: Spoken safety notifications in the active language (**English, Hindi, Tamil, or Kannada**) with an 8-second audio cool-down.

### 2. Citizen e-Sahayak AI Chat
*   **Smart Multi-Model Fallback**: Loops through available free models on OpenRouter (starting with the active `google/gemma-4-31b-it:free` model) with fallback to local rule-based matchers if offline.
*   **Certified Queries**: Responses cite sections of the Motor Vehicles Act and are stamped with an official Nic-MoRTH certified seal.
*   **Multilingual Voice Input**: Citizens can ask queries hands-free by speaking in any of the four supported languages.

### 3. Sarathi Licensing Quiz & e-Certificate
*   Test citizen awareness with a 3-question exam on Indian road laws.
*   Scores of 100% unlock a printable **Road Safety Awareness e-Certificate** from the *National Road Safety Council (NRSC)*.

### 4. Accessibility & UI Styling
*   **Official Design**: Tricolor ribbon headers, bilingual labels, and a marquee safety ticker.
*   **Proportional Font Scaling**: Sizing buttons (`A-`, `A`, `A+`) dynamically scale the root HTML font size, allowing all rem-based panels to resize proportionally.

---

## 🛠️ Technology Stack
*   **Frontend Framework**: React 19 + Vite 8
*   **CSS Styling**: Vanilla CSS + Tailwind
*   **GIS Maps**: React-Leaflet + Leaflet + OpenStreetMap (No API keys needed)
*   **AI Inference**: OpenRouter API (`google/gemma-4-31b-it:free`) / Gemini API v1 fallback
*   **Native Device Integrations**: HTML5 Geolocation API, Web Speech API (Voice Synthesis & Recognition), and Haptic Vibration API.

---

## 🔒 Privacy & Security Compliance
*   **Zero Data Retention**: Location, speed data, chat inputs, and quiz results are processed strictly in-memory in the browser. No databases are used, and no user data is stored.
*   **HTTPS-Only**: Geolocation, Speech Recognition, and Vibration APIs are blocked by browsers on insecure origins. Production deployment requires SSL/TLS (HTTPS).

---

## ⚡ Setup & Installation

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment Variables
Create a `.env` file in the project root:
```env
# Gemini API Key (Optional)
VITE_GEMINI_API_KEY="your_key"

# OpenRouter API Key (Recommended)
VITE_OPENROUTER_API_KEY="sk-or-v1-your_openrouter_key"
```

### Step 3: Run Dev Server
```bash
npm run dev
```
Access the portal at **[http://localhost:5174/](http://localhost:5174/)**.

### Step 4: Build for Production
```bash
npm run build
```
Deploy the generated `dist/` static files to any static host (Cloudflare Pages, Vercel, Netlify, or Amazon S3).
