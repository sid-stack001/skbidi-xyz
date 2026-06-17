"use client";
import { useState, useEffect } from "react";

const SKBIDI_ASCII = `
 ███████╗██╗  ██╗██████╗ ██╗██████╗ ██╗    ██╗  ██╗██╗   ██╗███████╗
 ██╔════╝██║ ██╔╝██╔══██╗██║██╔══██╗██║    ╚██╗██╔╝╚██╗ ██╔╝╚══███╔╝
 ███████╗█████╔╝ ██████╔╝██║██║  ██║██║     ╚███╔╝  ╚████╔╝   ███╔╝ 
 ╚════██║██╔═██╗ ██╔══██╗██║██║  ██║██║     ██╔██╗   ╚██╔╝   ███╔╝  
 ███████║██║  ██╗██████╔╝██║██████╔╝██║    ██╔╝ ██╗   ██║   ███████╗
 ╚══════╝╚═╝  ╚═╝╚═════╝ ╚═╝╚═════╝ ╚═╝    ╚═╝  ╚═╝   ╚═╝   ╚══════╝`;

const SUBTITLE_ASCII = `
 ██████╗ ██████╗  █████╗ ██╗███╗   ██╗██████╗  ██████╗ ████████╗
 ██╔══██╗██╔══██╗██╔══██╗██║████╗  ██║██╔══██╗██╔═══██╗╚══██╔══╝
 ██████╔╝██████╔╝███████║██║██╔██╗ ██║██████╔╝██║   ██║   ██║   
 ██╔══██╗██╔══██╗██╔══██║██║██║╚██╗██║██╔══██╗██║   ██║   ██║   
 ██████╔╝██║  ██║██║  ██║██║██║ ╚████║██║  ██║╚██████╔╝   ██║   
 ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝ ╚═════╝    ╚═╝   

 ██╗   ██╗██████╗ ██╗      ██████╗ ██████╗ ███╗   ██╗██╗   ██╗███████╗██████╗ ████████╗███████╗██████╗ 
 ██║   ██║██╔══██╗██║     ██╔════╝██╔═══██╗████╗  ██║██║   ██║██╔════╝██╔══██╗╚══██╔══╝██╔════╝██╔══██╗
 ██║   ██║██████╔╝██║     ██║     ██║   ██║██╔██╗ ██║██║   ██║█████╗  ██████╔╝   ██║   █████╗  ██████╔╝
 ██║   ██║██╔══██╗██║     ██║     ██║   ██║██║╚██╗██║╚██╗ ██╔╝██╔══╝  ██╔══██╗   ██║   ██╔══╝  ██╔══██╗
 ╚██████╔╝██║  ██║███████╗╚██████╗╚██████╔╝██║ ╚████║ ╚████╔╝ ███████╗██║  ██║   ██║   ███████╗██║  ██║
  ╚═════╝ ╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═════╝╚═╝  ╚═══╝  ╚═══╝  ╚══════╝╚═╝  ╚═╝   ╚═╝   ╚══════╝╚═╝  ╚═╝`;

const SKULL_ASCII = `
    ░░░░░░░░░░░░░░░░░
    ░░┌─────────────┐░░
    ░░│  ██     ██  │░░
    ░░│  ██     ██  │░░
    ░░│    ·····    │░░
    ░░│  ─────────  │░░
    ░░│  ██  █  ██  │░░
    ░░└─────────────┘░░
    ░░░░░░░░░░░░░░░░░`;

const DIVIDER = `░▒▓█▓▒░▒▓█▓▒░▒▓█▓▒░▒▓█▓▒░▒▓█▓▒░▒▓█▓▒░▒▓█▓▒░▒▓█▓▒░▒▓█▓▒░▒▓█▓▒░`;

export default function Home() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [linksGenerated, setLinksGenerated] = useState(0);
  const [victimsTricked, setVictimsTricked] = useState(0);
  const [colorIndex, setColorIndex] = useState(0);

  const titleColors = ["#ff6b35", "#ff00ff", "#00d4ff", "#00ff41", "#ffff00"];

  useEffect(() => {
    setMounted(true);

    fetch("/global-stats")
      .then(res => res.json())
      .then(data => {
        setLinksGenerated(data.linksGenerated);
        setVictimsTricked(data.victimsTricked);
      })
      .catch(() => { });

    const interval = setInterval(() => {
      setColorIndex(i => (i + 1) % titleColors.length);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  async function shorten() {
    if (!url) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (res.status === 429) {
        alert("⚠ Whoa there, slow down! You've hit the limit (10 links/hour). Try again later.");
        setLoading(false);
        return;
      }

      if (res.status === 401) {
        alert("⚠ Unauthorized. Something's misconfigured.");
        setLoading(false);
        return;
      }

      if (!res.ok) {
        alert("⚠ Something went wrong. Try again.");
        setLoading(false);
        return;
      }

      const data = await res.json();
      setResult(data.shortUrl);
    } catch (e) {
      alert("ERROR: Connection to mainframe failed.");
    }

    setLoading(false);
  }

  function copy() {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!mounted) return null;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        color: "#e8e8e8",
        fontFamily: "'Courier New', Courier, monospace",
        padding: "16px",
        overflowX: "hidden",
      }}
    >
      {/* ASCII HEADER — SKBIDI.XYZ */}
      <div style={{ textAlign: "center", marginBottom: 8, overflowX: "auto" }}>
        <pre
          style={{
            display: "inline-block",
            fontSize: "clamp(4px, 1vw, 11px)",
            lineHeight: 1.2,
            color: titleColors[colorIndex],
            transition: "color 0.4s ease",
            margin: 0,
            textAlign: "left",
          }}
        >
          {SKBIDI_ASCII}
        </pre>
      </div>

      {/* ASCII SUBTITLE */}
      <div style={{ textAlign: "center", marginBottom: 4, overflowX: "auto" }}>
        <pre
          style={{
            display: "inline-block",
            fontSize: "clamp(3px, 0.6vw, 7px)",
            lineHeight: 1.2,
            color: "#ff00ff",
            margin: 0,
            textAlign: "left",
            opacity: 0.85,
          }}
        >
          {SUBTITLE_ASCII}
        </pre>
      </div>

      {/* tagline */}
      <div style={{ textAlign: "center", marginBottom: 4 }}>
        <span style={{ color: "#00ff41", fontSize: 13 }}>
          [ make any link look extremely suspicious ]
        </span>
      </div>

      {/* stats bar */}
      <div style={{ textAlign: "center", marginBottom: 16, fontSize: 11, color: "#666" }}>
        <span style={{ color: "#00d4ff" }}>links generated:</span> {linksGenerated.toLocaleString()}
        &nbsp;|&nbsp;
        <span style={{ color: "#00ff41" }}>status:</span> ONLINE
        &nbsp;|&nbsp;
        <span style={{ color: "#ff6b35" }}>victims tricked:</span> {victimsTricked.toLocaleString()}
      </div>

      {/* colored divider */}
      <div
        style={{ textAlign: "center", marginBottom: 24, overflowX: "hidden" }}
      >
        <pre
          style={{
            fontSize: 10,
            margin: 0,
            background:
              "linear-gradient(90deg, #ff6b35, #ff00ff, #00d4ff, #00ff41, #ffff00)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            overflow: "hidden",
          }}
        >
          {DIVIDER}
        </pre>
      </div>

      {/* main content — 2 col on desktop, 1 col on mobile */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 24,
          maxWidth: 900,
          margin: "0 auto",
        }}
      >
        {/* LEFT — main tool */}
        <div
          style={{
            border: "1px solid #333",
            padding: 20,
            background: "#111",
          }}
        >
          {/* box header */}
          <div
            style={{
              borderBottom: "1px solid #333",
              paddingBottom: 8,
              marginBottom: 16,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span style={{ color: "#00d4ff", fontSize: 12 }}>
              ┌─[ SUSPICIFIER v3.0 ]
            </span>
            <span style={{ color: "#333", fontSize: 12 }}>registered ✓</span>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label
              style={{
                fontSize: 11,
                color: "#666",
                display: "block",
                marginBottom: 6,
              }}
            >
              &gt; enter target url:
            </label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && shorten()}
              placeholder="google.com"
              style={{
                width: "100%",
                background: "#0a0a0a",
                border: "1px solid #333",
                borderBottom: "2px solid #00d4ff",
                color: "#e8e8e8",
                padding: "10px 12px",
                fontFamily: "'Courier New', monospace",
                fontSize: 14,
                boxSizing: "border-box",
                outline: "none",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#00d4ff")}
              onBlur={(e) => (e.target.style.borderBottomColor = "#00d4ff")}
            />
          </div>

          <button
            onClick={shorten}
            disabled={loading}
            style={{
              width: "100%",
              background: loading ? "#1a1a1a" : "#0a0a0a",
              border: "1px solid",
              borderColor: loading ? "#333" : "#00ff41",
              color: loading ? "#444" : "#00ff41",
              padding: "12px",
              fontFamily: "'Courier New', monospace",
              fontSize: 14,
              cursor: loading ? "wait" : "pointer",
              letterSpacing: 2,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.background = "#00ff41";
                e.target.style.color = "#0a0a0a";
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "#0a0a0a";
              e.target.style.color = loading ? "#444" : "#00ff41";
            }}
          >
            {loading ? "[ GENERATING... ]" : "[ MAKE IT SUS ]"}
          </button>

          {result && (
            <div style={{ marginTop: 20 }}>
              <div
                style={{
                  borderLeft: "3px solid #00ff41",
                  paddingLeft: 12,
                  marginBottom: 12,
                }}
              >
                <div style={{ fontSize: 10, color: "#666", marginBottom: 6 }}>
                  &gt; suspicification complete. send to victim:
                </div>
                <div
                  style={{
                    color: "#00d4ff",
                    fontSize: 13,
                    wordBreak: "break-all",
                    lineHeight: 1.6,
                  }}
                >
                  {result}
                </div>
              </div>
              <button
                onClick={copy}
                style={{
                  background: copied ? "#00ff41" : "#0a0a0a",
                  border: "1px solid #00ff41",
                  color: copied ? "#0a0a0a" : "#00ff41",
                  padding: "8px 20px",
                  fontFamily: "'Courier New', monospace",
                  fontSize: 12,
                  cursor: "pointer",
                  letterSpacing: 1,
                  transition: "all 0.15s",
                }}
              >
                {copied ? "[ COPIED ✓ ]" : "[ COPY LINK ]"}
              </button>
            </div>
          )}
        </div>

        {/* RIGHT — ASCII art + info */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* skull */}
          <div
            style={{
              border: "1px solid #333",
              padding: 16,
              background: "#111",
              textAlign: "center",
            }}
          >
            <pre
              style={{
                fontSize: 12,
                margin: 0,
                lineHeight: 1.4,
                color: "#ff6b35",
                display: "inline-block",
                textAlign: "left",
              }}
            >
              {SKULL_ASCII}
            </pre>
            <div style={{ marginTop: 8, fontSize: 11, color: "#ff6b35" }}>
              ⚠ WARNING: 100% SAFE ⚠
            </div>
          </div>

          {/* how it works */}
          <div
            style={{
              border: "1px solid #333",
              padding: 16,
              background: "#111",
              fontSize: 12,
              lineHeight: 1.8,
            }}
          >
            <div style={{ color: "#ff00ff", marginBottom: 8, fontSize: 11 }}>
              ┌─[ HOW IT WORKS ]
            </div>
            <div style={{ color: "#666" }}>
              <span style={{ color: "#00d4ff" }}>01.</span> paste any url
            </div>
            <div style={{ color: "#666" }}>
              <span style={{ color: "#00d4ff" }}>02.</span> we make it look
              extremely suspicious
            </div>
            <div style={{ color: "#666" }}>
              <span style={{ color: "#00d4ff" }}>03.</span> send to unsuspecting
              victim
            </div>
            <div style={{ color: "#666" }}>
              <span style={{ color: "#00d4ff" }}>04.</span> they panic. you
              laugh. link works fine.
            </div>
          </div>

          {/* example links */}
          <div
            style={{
              border: "1px solid #333",
              padding: 16,
              background: "#111",
              fontSize: 11,
            }}
          >
            <div style={{ color: "#ff00ff", marginBottom: 8 }}>
              ┌─[ SAMPLE OUTPUTS ]
            </div>
            {[
              {
                color: "#ff6b35",
                text: "skbidi.xyz/npc-80e/touch-grass?skill_issue=true",
              },
              {
                color: "#00ff41",
                text: "skbidi.xyz/rizz-5f3/gyatt/results?score=over9000",
              },
              {
                color: "#00d4ff",
                text: "skbidi.xyz/gpt-3a1/jailbreak/DAN?token=ff2c9a",
              },
              {
                color: "#ff00ff",
                text: "skbidi.xyz/free-bb2/robux/claim?amt=999999",
              },
            ].map((ex, i) => (
              <div
                key={i}
                style={{
                  color: ex.color,
                  marginBottom: 4,
                  wordBreak: "break-all",
                }}
              >
                &gt; {ex.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* bottom divider */}
      <div
        style={{
          textAlign: "center",
          margin: "24px 0 8px",
          overflowX: "hidden",
        }}
      >
        <pre
          style={{
            fontSize: 10,
            margin: 0,
            background:
              "linear-gradient(90deg, #00ff41, #00d4ff, #ff00ff, #ff6b35)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            overflow: "hidden",
          }}
        >
          {DIVIDER}
        </pre>
      </div>

      {/* footer */}
      <div
        style={{
          textAlign: "center",
          fontSize: 10,
          color: "#333",
          paddingBottom: 16,
        }}
      >
        <span style={{ color: "#ff6b35" }}>skbidi.xyz</span>
        &nbsp;·&nbsp; no data collected &nbsp;·&nbsp; no cookies &nbsp;·&nbsp;
        yes it's free &nbsp;·&nbsp;
        <span style={{ color: "#00ff41" }}>built for chaos</span>
      </div>
    </main>
  );
}
