"use client";

import { useEffect, useState } from "react";

interface WeatherData {
  temperature: number;
}

function RainDrops() {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
      {Array.from({ length: 60 }).map((_, i) => (
        <div
          key={i}
          className="rain-drop"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${0.6 + Math.random() * 0.8}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const tick = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=68.2&longitude=14.4&current=temperature_2m&timezone=Europe%2FOslo"
    )
      .then((r) => r.json())
      .then((d) => setWeather({ temperature: Math.round(d.current.temperature_2m) }))
      .catch(() => setWeather({ temperature: 3 }));
  }, []);

  const dateStr = time.toLocaleDateString("en-GB", { weekday: "long", month: "long", day: "numeric" });
  const timeStr = time.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      <style>{`
        @keyframes fall {
          0% { transform: translateY(-10px); opacity: 0.7; }
          100% { transform: translateY(420px); opacity: 0.2; }
        }
        .rain-drop {
          position: absolute;
          top: -10px;
          width: 1px;
          height: 12px;
          background: rgba(255,255,255,0.35);
          border-radius: 1px;
          animation: fall linear infinite;
        }
      `}</style>

      <div
        style={{ backgroundColor: "#1B1B1B" }}
        className="min-h-screen flex items-center justify-center"
      >
        <div
          className="relative overflow-hidden rounded-2xl"
          style={{ width: 400, height: 400 }}
        >
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/lofoten-bg.jpg')" }}
          />

          {/* Rain */}
          <RainDrops />

          {/* Content */}
          <div
            className="absolute inset-0 flex flex-col justify-between"
            style={{ padding: 32 }}
          >
            {/* Top row */}
            <div className="flex justify-between items-start">
              <div>
                <p
                  className="text-white font-semibold leading-tight"
                  style={{ fontSize: 18 }}
                >
                  Today
                </p>
                <p
                  className="text-white font-semibold leading-tight"
                  style={{ fontSize: 18 }}
                >
                  {timeStr}
                </p>
              </div>
              <p
                className="text-white leading-none"
                style={{
                  fontSize: 72,
                  fontWeight: 900,
                  letterSpacing: "-2px",
                  lineHeight: 1,
                }}
              >
                {weather ? `${weather.temperature}°` : "–°"}
              </p>
            </div>

            {/* Bottom */}
            <p
              className="text-white font-semibold"
              style={{ fontSize: 18 }}
            >
              Lofoten
              <br />
              Norway
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
