// Simple keyword-based replies for the chat bot. Answers are built from profile.ts, so they stay in sync.
import { profile } from "./profile";

export type BotReply = { text: string; link?: { label: string; href: string } };

// `open` = the live "open to opportunities" status.
type Intent = { keywords: string[]; reply: (open: boolean) => BotReply };

const work = profile.journey.filter((s) => s.kind !== "education").reverse(); // most recent first
const education = profile.journey.filter((s) => s.kind === "education");
const project = (name: string) => profile.projects.find((p) => p.name === name);

function projectReply(name: string): BotReply {
  const p = project(name);
  if (!p) return fallback();
  return { text: `${p.name} (${p.tag}): ${p.points.join(" ")}`, link: { label: "See it on the attention map", href: "#work" } };
}

function fallback(): BotReply {
  return {
    text: "I'm a simple bot, so I didn't catch that. Try asking about my skills, projects, experience, education, or how to contact me.",
  };
}

const INTENTS: Intent[] = [
  {
    keywords: ["hi", "hii", "hello", "hey", "vanakkam", "good morning", "good evening", "good afternoon"],
    reply: () => ({
      text: `Hi! I'm a little bot that speaks for ${profile.firstName}. Ask me about my skills, projects, experience, or how to reach me.`,
    }),
  },
  {
    keywords: ["who", "about", "yourself", "introduce", "summary", "tell me about you"],
    reply: () => ({ text: `I'm ${profile.name}, an ${profile.role} from ${profile.location}. ${profile.summary}` }),
  },
  {
    keywords: ["skill", "skills", "tech", "stack", "tools", "technologies", "languages", "python", "java"],
    reply: () => ({
      text: `My core stack is ${profile.mapSkills.join(", ")}. I also work with ${profile.extraSkills.join(", ")}.`,
      link: { label: "Explore the attention map", href: "#work" },
    }),
  },
  {
    keywords: ["project", "projects", "built", "portfolio", "work on", "worked on"],
    reply: () => ({
      text: `I've built ${profile.projects.length} main projects: ${profile.projects
        .map((p) => `${p.name} (${p.tag})`)
        .join("; ")}. Ask me about any of them by name.`,
      link: { label: "See projects", href: "#work" },
    }),
  },
  { keywords: ["agentbuilder", "agent builder", "agent", "agents", "mcp", "tool calling"], reply: () => projectReply("AgentBuilder") },
  {
    keywords: ["passport", "ocr", "identity", "id card", "verification", "opencv", "tesseract", "document"],
    reply: () => projectReply("Passport & ID Verification"),
  },
  { keywords: ["furnicraft", "e-commerce", "ecommerce", "shop", "spring", "spring boot"], reply: () => projectReply("FurniCraft") },
  {
    keywords: ["rag", "retrieval", "embedding", "embeddings", "vector", "langchain", "llm", "genai", "generative"],
    reply: () => ({
      text: "Generative AI is my main focus. At HeroApps I build RAG pipelines with embeddings and vector databases, LLM workflows with LangChain and the OpenAI API, and AI agents with tool calling. My AgentBuilder project combines RAG, agents and MCP.",
    }),
  },
  {
    keywords: ["experience", "job", "work", "company", "heroapps", "intern", "internship", "career", "current", "currently"],
    reply: () => ({
      text: work.map((s) => `${s.title} at ${s.org}, ${s.dates}. ${s.points[0]}`).join(" Before that: "),
      link: { label: "See my journey", href: "#journey" },
    }),
  },
  {
    keywords: ["education", "study", "studies", "college", "degree", "btech", "b.tech", "diploma", "cgpa", "school", "student"],
    reply: () => ({
      text: education
        .slice()
        .reverse()
        .map((s) => `${s.title} at ${s.org} (${s.dates}): ${s.points.join(" ")}`)
        .join(" Earlier, "),
      link: { label: "See my journey", href: "#journey" },
    }),
  },
  {
    keywords: ["achievement", "achievements", "award", "awards", "prize", "rank", "certification", "certifications", "certificate", "certified"],
    reply: () => ({
      text: profile.facts
        .filter((f) => f.key !== "education")
        .map((f) => `${f.value} (${f.sub})`)
        .join(". "),
    }),
  },
  {
    keywords: ["contact", "email", "mail", "hire", "reach", "available", "opportunity", "opportunities", "collaborate", "freelance"],
    reply: (open) => ({
      text: open
        ? `I'm open to opportunities! Email me at ${profile.email}, or use the message box at the bottom of the page.`
        : `I'm busy with current work right now, but I'm always happy to talk. Email me at ${profile.email}.`,
      link: { label: "Go to contact", href: "#contact" },
    }),
  },
  {
    keywords: ["where", "location", "live", "based", "city", "salem", "india", "tamil nadu"],
    reply: () => ({ text: `I'm based in ${profile.location}, India, and I work remotely with HeroApps in London.` }),
  },
  {
    keywords: ["resume", "cv"],
    reply: () =>
      profile.links.resume
        ? { text: "Here's my resume.", link: { label: "Open resume", href: profile.links.resume } }
        : { text: `Email me at ${profile.email} and I'll send my resume right away.`, link: { label: "Go to contact", href: "#contact" } },
  },
  { keywords: ["thanks", "thank you", "thank", "great", "nice", "cool", "awesome"], reply: () => ({ text: "Thank you! Anything else you'd like to know?" }) },
  { keywords: ["bye", "goodbye", "see you"], reply: () => ({ text: "Bye! Thanks for visiting my portfolio." }) },
];

export const BOT_GREETING: BotReply = INTENTS[0].reply(true);
export const BOT_SUGGESTIONS = ["Who are you?", "Your skills", "Your projects", "Experience", "Education", "How to contact you?"];

/** Picks the intent whose keywords best match the message (longer matches count more). */
export function botReply(message: string, open = true): BotReply {
  const text = ` ${message.toLowerCase().replace(/[^a-z0-9.+\- ]/g, " ")} `;
  let best: Intent | undefined;
  let bestScore = 0;
  for (const intent of INTENTS) {
    const score = intent.keywords.reduce((sum, k) => (text.includes(` ${k} `) ? sum + k.length : sum), 0);
    if (score > bestScore) {
      best = intent;
      bestScore = score;
    }
  }
  return best ? best.reply(open) : fallback();
}
