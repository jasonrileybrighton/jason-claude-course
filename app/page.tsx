"use client";

import { useEffect, useState } from "react";

interface WeatherData {
  temperature: number;
  condition: "clear" | "cloudy" | "rain" | "snow" | "fog" | "storm";
}

interface Location {
  city: string;
  country: string;
}

function getCondition(code: number): WeatherData["condition"] {
  if (code === 0 || code === 1) return "clear";
  if (code === 2 || code === 3) return "cloudy";
  if (code === 45 || code === 48) return "fog";
  if (code >= 51 && code <= 67) return "rain";
  if (code >= 71 && code <= 77) return "snow";
  if (code >= 80 && code <= 82) return "rain";
  if (code >= 85 && code <= 86) return "snow";
  if (code >= 95 && code <= 99) return "storm";
  return "cloudy";
}

const overlays: Record<WeatherData["condition"], string> = {
  clear:  "rgba(180, 120, 40, 0.25)",
  cloudy: "rgba(60, 80, 100, 0.25)",
  rain:   "rgba(20, 40, 80, 0.35)",
  snow:   "rgba(180, 200, 220, 0.30)",
  fog:    "rgba(160, 160, 150, 0.40)",
  storm:  "rgba(10, 10, 30, 0.55)",
};

const conditionLabel: Record<WeatherData["condition"], string> = {
  clear:  "Clear",
  cloudy: "Cloudy",
  rain:   "Rain",
  snow:   "Snow",
  fog:    "Fog",
  storm:  "Storm",
};

function Particles({ condition }: { condition: WeatherData["condition"] }) {
  const [drops, setDrops] = useState<{ left: string; delay: string; duration: string }[]>([]);

  useEffect(() => {
    if (condition !== "rain" && condition !== "snow" && condition !== "storm") {
      setDrops([]);
      return;
    }
    const count = condition === "storm" ? 90 : 60;
    setDrops(
      Array.from({ length: count }).map(() => {
        const duration = 0.4 + Math.random() * 0.8;
        return {
          left: `${Math.random() * 100}%`,
          delay: `-${Math.random() * duration}s`,
          duration: `${duration}s`,
        };
      })
    );
  }, [condition]);

  if (!drops.length) return null;

  const isSnow = condition === "snow";

  return (
    <div className="absolute inset-0 pointer-events-none">
      {drops.map((d, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: -10,
            left: d.left,
            ...(isSnow
              ? {
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.75)",
                  animation: `snow-fall ${d.duration} ${d.delay} linear infinite`,
                }
              : {
                  width: 1,
                  height: condition === "storm" ? 16 : 12,
                  borderRadius: 1,
                  background: "rgba(255,255,255,0.35)",
                  animation: `rain-fall ${d.duration} ${d.delay} linear infinite`,
                }),
          }}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [status, setStatus] = useState<"loading" | "denied" | "ready">("loading");
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const tick = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus("denied");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;

        const [weatherRes, geoRes] = await Promise.all([
          fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`
          ),
          fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
            { headers: { "Accept-Language": "en" } }
          ),
        ]);

        const weatherData = await weatherRes.json();
        const geoData = await geoRes.json();

        const temp = Math.round(weatherData.current.temperature_2m);
        const condition = getCondition(weatherData.current.weather_code);
        const city =
          geoData.address?.city ||
          geoData.address?.town ||
          geoData.address?.village ||
          geoData.address?.county ||
          "Unknown";
        const country = geoData.address?.country || "";

        setWeather({ temperature: temp, condition });
        setLocation({ city, country });
        setStatus("ready");
      },
      () => setStatus("denied")
    );
  }, []);

  const timeStr = time.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const condition = weather?.condition ?? "cloudy";

  return (
    <>
      <style>{`
        @keyframes rain-fall {
          0%   { transform: translateY(-10px); opacity: 0.7; }
          100% { transform: translateY(420px); opacity: 0.2; }
        }
        @keyframes snow-fall {
          0%   { transform: translateY(-10px) translateX(0px); opacity: 0.9; }
          50%  { transform: translateY(200px) translateX(8px); opacity: 0.7; }
          100% { transform: translateY(420px) translateX(-4px); opacity: 0.2; }
        }
      `}</style>

<div
        style={{ backgroundColor: "#1B1B1B" }}
        className="min-h-screen flex items-center justify-center"
      >
        <div
          className="relative overflow-hidden rounded-2xl"
          style={{ width: 400, height: 400, transform: "translateZ(0)", isolation: "isolate" }}
        >
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/lofoten-bg.jpg')" }}
          />

          {/* Condition tint overlay */}
          <div
            className="absolute inset-0 transition-colors duration-1000"
            style={{ backgroundColor: overlays[condition] }}
          />

          {/* Particles (rain / snow) */}
          <Particles condition={condition} />

          {/* Content */}
          <div
            className="absolute inset-0 flex flex-col justify-between"
            style={{ padding: 32 }}
          >
            {/* Top row */}
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white font-semibold leading-tight" style={{ fontSize: 18 }}>
                  Today
                </p>
                <p className="text-white font-semibold leading-tight" style={{ fontSize: 18 }}>
                  {timeStr}
                </p>
              </div>
              <p
                className="text-white leading-none"
                style={{ fontSize: 72, fontWeight: 900, letterSpacing: "-2px", lineHeight: 1 }}
              >
                {status === "ready" && weather ? `${weather.temperature}°` : "–°"}
              </p>
            </div>

            {/* Bottom */}
            <div className="flex justify-between items-end">
              <div>
                {status === "denied" ? (
                  <p className="text-white font-semibold" style={{ fontSize: 18 }}>
                    Location access denied
                  </p>
                ) : status === "loading" ? (
                  <p className="text-white font-semibold opacity-60" style={{ fontSize: 18 }}>
                    Locating…
                  </p>
                ) : (
                  <p className="text-white font-semibold" style={{ fontSize: 18 }}>
                    {location?.city}
                    <br />
                    {location?.country}
                  </p>
                )}
              </div>
              {status === "ready" && (
                <p className="text-white font-semibold opacity-70" style={{ fontSize: 14 }}>
                  {conditionLabel[condition]}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
