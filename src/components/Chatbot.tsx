"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { BOT_GREETING, BOT_SUGGESTIONS, botReply, type BotReply } from "@/content/bot";
import { profile } from "@/content/profile";
import { getOpenStatus } from "@/lib/status";

type Message = { id: number; from: "bot" | "user"; text: string; link?: BotReply["link"] };

// Minimal typing for the Web Speech recognition API (not in TypeScript's DOM lib everywhere).
type Recognition = {
  lang: string;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

function recognitionClass() {
  const w = window as unknown as Record<string, (new () => Recognition) | undefined>;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

const noSubscribe = () => () => {};
const useCanSpeak = () => useSyncExternalStore(noSubscribe, () => "speechSynthesis" in window, () => false);
const useCanListen = () => useSyncExternalStore(noSubscribe, () => !!recognitionClass(), () => false);

function pickVoice() {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang === "en-IN" && /ravi|prabhat|male/i.test(v.name)) ??
    voices.find((v) => v.lang === "en-IN") ??
    voices.find((v) => v.lang === "en-GB") ??
    voices.find((v) => v.lang.startsWith("en"))
  );
}

/** The photo, zoomed to the face, in a circle. Pulses while the bot is speaking. */
function Avatar({ size, speaking }: { size: number; speaking: boolean }) {
  return (
    <span
      className={`relative block shrink-0 rounded-full ${speaking ? "animate-pulse-ring" : ""}`}
      style={{ width: size, height: size }}
    >
      <span className={`absolute inset-0 overflow-hidden rounded-full border-2 border-white bg-white ${speaking ? "animate-talk" : ""}`}>
        <Image
          src={profile.photo.src}
          width={profile.photo.width}
          height={profile.photo.height}
          alt=""
          sizes="200px"
          className="absolute max-w-none"
          style={{ width: "330%", height: "auto", left: "-122%", top: "-20%" }}
        />
      </span>
    </span>
  );
}

function SpeakingBars() {
  return (
    <span aria-hidden="true" className="inline-flex h-3 items-end gap-0.5">
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className="eq-bar block h-3 w-0.5 rounded-full bg-hot" style={{ animationDelay: `${i * 0.12}s` }} />
      ))}
    </span>
  );
}

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [voiceOn, setVoiceOn] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [reveal, setReveal] = useState<{ id: number; words: number } | null>(null);
  const canSpeak = useCanSpeak();
  const canListen = useCanListen();
  const nextId = useRef(0);
  const revealTimer = useRef<ReturnType<typeof setInterval>>(undefined);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognition = useRef<Recognition | null>(null);

  // Keep the newest message in view while replies stream in.
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, reveal]);

  // Stop talking and listening when the bot goes away.
  useEffect(
    () => () => {
      clearInterval(revealTimer.current);
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      recognition.current?.stop();
    },
    [],
  );

  function speak(text: string) {
    if (!canSpeak || !voiceOn) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/[·—•;]/g, ", ").replace(/\s+/g, " "));
    const voice = pickVoice();
    if (voice) utterance.voice = voice;
    utterance.lang = voice?.lang ?? "en-IN";
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    synth.speak(utterance);
  }

  function addBotMessage(reply: BotReply) {
    const id = nextId.current++;
    setMessages((m) => [...m, { id, from: "bot", ...reply }]);
    // Stream the reply word by word, like a model generating tokens.
    const total = reply.text.split(" ").length;
    clearInterval(revealTimer.current);
    setReveal({ id, words: 0 });
    revealTimer.current = setInterval(() => {
      setReveal((r) => {
        if (!r || r.words >= total) {
          clearInterval(revealTimer.current);
          return null;
        }
        return { id, words: r.words + 1 };
      });
    }, 45);
    // Speak right away, inside the click/tap, so mobile browsers allow audio.
    speak(reply.text);
  }

  function openBot() {
    setOpen(true);
    if (messages.length === 0) addBotMessage(BOT_GREETING);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function closeBot() {
    setOpen(false);
    if (canSpeak) window.speechSynthesis.cancel();
    setSpeaking(false);
    recognition.current?.stop();
  }

  function send(text: string) {
    const message = text.trim();
    if (!message) return;
    setMessages((m) => [...m, { id: nextId.current++, from: "user", text: message }]);
    setInput("");
    addBotMessage(botReply(message, getOpenStatus()));
  }

  function toggleVoice() {
    if (voiceOn && canSpeak) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
    setVoiceOn((v) => !v);
  }

  function toggleListening() {
    if (listening) {
      recognition.current?.stop();
      return;
    }
    const Ctor = recognitionClass();
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = "en-IN";
    rec.interimResults = false;
    rec.onresult = (e) => {
      const transcript = e.results[0]?.[0]?.transcript ?? "";
      if (transcript) send(transcript);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognition.current = rec;
    if (canSpeak) window.speechSynthesis.cancel();
    setListening(true);
    rec.start();
  }

  const status = listening ? "listening…" : speaking ? "speaking" : "online · simple replies";

  return (
    <>
      {!open && (
        <div className="fixed right-4 bottom-4 z-40 flex items-end gap-3 sm:right-6 sm:bottom-6">
          <span className="animate-hint-in mb-2 hidden rounded-2xl rounded-br-sm border border-line bg-white px-4 py-2.5 text-[15px] shadow-lg sm:block">
            Hi! Ask me anything.
          </span>
          <button
            type="button"
            onClick={openBot}
            aria-label={`Chat with ${profile.firstName}'s bot`}
            className="rounded-full shadow-xl ring-2 ring-hot transition-transform hover:scale-105"
          >
            <Avatar size={60} speaking={false} />
            <span className="absolute -top-0.5 -right-0.5 size-4 rounded-full border-2 border-white bg-[#22c55e]" />
          </button>
        </div>
      )}

      {open && (
        <div
          role="dialog"
          aria-label={`Chat with ${profile.firstName}'s bot`}
          onKeyDown={(e) => e.key === "Escape" && closeBot()}
          className="animate-pop-in fixed inset-x-0 bottom-0 z-40 flex h-[min(640px,88dvh)] flex-col overflow-hidden rounded-t-3xl border border-line bg-white shadow-2xl sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[400px] sm:rounded-3xl"
        >
          <div className="flex items-center gap-3 border-b border-line bg-paper px-4 py-3.5">
            <Avatar size={48} speaking={speaking} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{profile.name}&apos;s bot</p>
              <p className="flex items-center gap-2 font-mono text-xs text-muted" aria-live="polite">
                {speaking && <SpeakingBars />}
                {status}
              </p>
            </div>
            {canSpeak && (
              <button
                type="button"
                onClick={toggleVoice}
                aria-pressed={voiceOn}
                aria-label={voiceOn ? "Mute voice replies" : "Turn on voice replies"}
                className="flex size-11 items-center justify-center rounded-full hover:bg-line"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M11 5 6 9H2v6h4l5 4V5z" />
                  {voiceOn ? <path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" /> : <path d="m22 9-6 6M16 9l6 6" />}
                </svg>
              </button>
            )}
            <button
              type="button"
              onClick={closeBot}
              aria-label="Close chat"
              className="flex size-11 items-center justify-center rounded-full hover:bg-line"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
            {messages.map((m) => {
              const streaming = reveal?.id === m.id;
              const text = streaming ? m.text.split(" ").slice(0, reveal.words).join(" ") : m.text;
              return m.from === "user" ? (
                <div key={m.id} className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-ink px-4 py-2.5 text-[15px] text-paper">
                  {m.text}
                </div>
              ) : (
                <div key={m.id} className="flex max-w-[90%] items-end gap-2">
                  <Avatar size={28} speaking={false} />
                  <div className="rounded-2xl rounded-bl-sm bg-paper px-4 py-2.5 text-[15px] leading-relaxed">
                    {text}
                    {streaming && <span className="animate-blink ml-0.5 inline-block h-[1em] w-0.5 bg-hot align-[-0.15em]" />}
                    {!streaming && m.link && (
                      <a
                        href={m.link.href}
                        onClick={() => window.matchMedia("(max-width: 639px)").matches && closeBot()}
                        className="mt-2 block font-mono text-[13px] text-attn underline underline-offset-4"
                      >
                        {m.link.label} →
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-2 overflow-x-auto px-4 pb-2.5">
            {BOT_SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                className="min-h-9 shrink-0 rounded-full border border-line-strong bg-white px-3 font-mono text-xs hover:border-ink"
              >
                {s}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-line p-3"
          >
            <label htmlFor="bot-input" className="sr-only">
              Your question
            </label>
            <input
              id="bot-input"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={listening ? "Listening…" : "Ask about skills, projects…"}
              autoComplete="off"
              className="min-h-11 min-w-0 flex-1 rounded-full border border-line-strong bg-paper px-4 text-base outline-none focus:border-attn"
            />
            {canListen && (
              <button
                type="button"
                onClick={toggleListening}
                aria-pressed={listening}
                aria-label={listening ? "Stop listening" : "Ask with your voice"}
                className={`flex size-11 shrink-0 items-center justify-center rounded-full border ${
                  listening ? "animate-pulse-ring border-hot bg-hot text-ink" : "border-line-strong hover:border-ink"
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="9" y="3" width="6" height="11" rx="3" />
                  <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
                </svg>
              </button>
            )}
            <button
              type="submit"
              aria-label="Send"
              className="flex size-11 shrink-0 items-center justify-center rounded-full bg-ink text-paper hover:bg-attn"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
