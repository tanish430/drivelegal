import { useEffect, useRef, useState } from 'react';

const fallbackSentences = [
  {
    parts: [{ text: 'Drive', italic: false }],
    parts2: [{ text: 'Legal', italic: false }],
  },
];

function renderPart(part, idx) {
  if (part.italic) {
    return (
      <i key={idx} className="font-[Playfair_Display] italic">
        {part.text}
      </i>
    );
  }
  return <span key={idx}>{part.text}</span>;
}

export default function Hero({ sentences = fallbackSentences }) {
  const [currentSentence, setCurrentSentence] = useState(0);
  const [visible, setVisible] = useState(false);
  const canvasRef = useRef(null);

  const allSentences = Array.isArray(sentences) && sentences.length > 0 ? sentences : fallbackSentences;

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    const interval = setInterval(() => {
      setCurrentSentence((prev) => (prev + 1) % allSentences.length);
    }, 1800);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let time = 0;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/assets/monopo-hero.jpg';

    let imgLoaded = false;
    img.onload = () => {
      imgLoaded = true;
    };

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.offsetWidth;
      canvas.height = parent.offsetHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    const drawLens = () => {
      time += 0.005;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      if (imgLoaded && w > 0 && h > 0) {
        const imgAspect = img.width / img.height;
        const canvasAspect = w / h;

        let drawW;
        let drawH;
        let drawX;
        let drawY;

        if (imgAspect > canvasAspect) {
          drawH = h;
          drawW = h * imgAspect;
          drawX = (w - drawW) / 2;
          drawY = 0;
        } else {
          drawW = w;
          drawH = w / imgAspect;
          drawX = 0;
          drawY = (h - drawH) / 2;
        }

        ctx.drawImage(img, drawX, drawY, drawW, drawH);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, w, h);

        const lensRadius = Math.min(w, h) * 0.2;
        const lensX = w / 2 + Math.sin(time * 0.35) * (w * 0.12);
        const lensY = h / 2 + Math.cos(time * 0.5) * (h * 0.08);
        const mag = 2.2;

        const lensSize = Math.round(lensRadius * 2);
        const lensCanvas = document.createElement('canvas');
        lensCanvas.width = lensSize;
        lensCanvas.height = lensSize;

        const lctx = lensCanvas.getContext('2d');
        if (!lctx) {
          animId = requestAnimationFrame(drawLens);
          return;
        }

        const srcX = drawX + (drawW - drawW / mag) / 2;
        const srcY = drawY + (drawH - drawH / mag) / 2;
        const srcW = drawW / mag;
        const srcH = drawH / mag;

        lctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, lensSize, lensSize);

        ctx.save();
        ctx.beginPath();
        ctx.arc(lensX, lensY, lensRadius, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(lensCanvas, lensX - lensRadius, lensY - lensRadius);

        const glare = ctx.createLinearGradient(
          lensX - lensRadius,
          lensY - lensRadius,
          lensX + lensRadius,
          lensY + lensRadius
        );
        glare.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
        glare.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
        glare.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
        ctx.fillStyle = glare;
        ctx.fill();
        ctx.restore();

        ctx.beginPath();
        ctx.arc(lensX, lensY, lensRadius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(lensX, lensY, lensRadius - 2, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else {
        const gradient = ctx.createRadialGradient(
          w / 2,
          h / 2,
          0,
          w / 2,
          h / 2,
          w * 0.6
        );
        gradient.addColorStop(0, 'rgba(30, 30, 35, 0.95)');
        gradient.addColorStop(1, 'rgba(15, 15, 18, 1)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
      }

      animId = requestAnimationFrame(drawLens);
    };

    drawLens();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);


  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div className="canvas-container absolute inset-0 w-full h-full">
        <div className="gradient absolute inset-0 z-10 pointer-events-none" />
        <a
          href="https://monopo.vn/project/canada-goose-%E2%80%94-nomad-collection"
          target="_blank"
          rel="noreferrer"
          className="absolute inset-0 z-20"
          aria-label="Canada Goose — Nomad Collection"
        />
        <canvas
          ref={canvasRef}
          id="lens-artwork"
          className="absolute inset-0 w-full h-full"
          style={{ filter: 'contrast(1.05) saturate(0.95)' }}
        />
      </div>

      <div
        id="intro-container"
        className="relative z-30 flex flex-col items-center justify-center h-full px-6"
      >
        <div id="intro" className={`sentences ${visible ? 'is-inview' : ''}`}>
          <ul className="relative inline-block">
            {allSentences.map((sent, idx) => (
              <li
                key={idx}
                className={`transition-all duration-1000 ${currentSentence === idx ? 'active' : ''}`}
              >
                <div className="flex flex-col items-center">
                  <span className="container--word block">
                    <span className="part--first text-brand text-[#f5f5f0] text-4xl sm:text-5xl md:text-7xl lg:text-[100px] font-medium leading-none tracking-tight">
                      {sent.parts.map((part, pidx) => renderPart(part, pidx))}
                    </span>
                  </span>
                  <span className="container--word block">
                    <span className="part--second text-brand text-[#f5f5f0] text-4xl sm:text-5xl md:text-7xl lg:text-[100px] font-medium leading-none tracking-tight">
                      {sent.parts2.map((part, pidx) => renderPart(part, pidx))}
                    </span>
                  </span>
                </div>
              </li>
            ))}

            <li className="invisible">
              <div className="flex flex-col items-center">
                <span className="container--word block">
                  <span className="text-brand text-[#f5f5f0] text-4xl sm:text-5xl md:text-7xl lg:text-[100px] font-medium leading-none">
                    Drive
                  </span>
                </span>
                <span className="container--word block">
                  <span className="text-brand text-[#f5f5f0] text-4xl sm:text-5xl md:text-7xl lg:text-[100px] font-medium leading-none">
                    Legal
                  </span>
                </span>
              </div>
            </li>
          </ul>
        </div>

        {/* scroll logo removed per user request */}
      </div>
    </div>
  );
}
