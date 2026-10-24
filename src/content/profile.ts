// All portfolio content lives here. Edit this file to change what the site says.

export type Project = {
  name: string;
  tag: string;
  description: string;
  points: string[];
  // Skills from `mapSkills` this project used, with a 0–1 weight (line thickness on the attention map).
  uses: [skill: string, weight: number][];
  links?: { label: string; href: string }[];
};

export type Checkpoint = {
  label: string;
  kind: "education" | "internship" | "work";
  dates: string;
  title: string;
  org: string;
  points: string[];
  note: string;
};

export const profile = {
  name: "Rajesh R",
  firstName: "Rajesh",
  handle: "rajesh",
  role: "AI / Generative AI Developer",
  location: "Salem, Tamil Nadu",
  email: "rajeshrajendran1102@gmail.com",
  currently: "AI/ML Developer at HeroApps, London (remote)",

  // Leave a link empty ("") to hide it on the site.
  links: {
    github: "",
    linkedin: "",
    resume: "", // e.g. "/rajesh-r-resume.pdf" after adding the file to /public
  },

  photo: { src: "/rajesh.jpeg", width: 1086, height: 1448 },

  // The hero headline, split into the tokens that stream in one by one.
  headline: ["I", " build", " LLM", " agents", ",", " RAG", " pipelines", " and", " AI", " automation", "."],

  summary:
    "I build Python-based Generative AI applications — LLM workflows, RAG pipelines and AI agents — with LangChain, the OpenAI API, embeddings and vector databases. Today I do this as an AI/ML Developer at HeroApps (London, remote) while completing my B.Tech in Information Technology.",

  // Bio sentence; {0}, {1}, {2} are the hoverable words, with the alternatives the "model" considered.
  bio: "I'm Rajesh, an AI developer from Salem who loves to {0} LLM-powered tools — from {1} pipelines and agents to the {2} services that run them.",
  bioWords: [
    [["build", 0.61], ["ship", 0.24], ["prototype", 0.09], ["debug", 0.06]],
    [["retrieval", 0.48], ["agent", 0.33], ["OCR", 0.19]],
    [["backend", 0.52], ["API", 0.31], ["automation", 0.17]],
  ] as [string, number][][],

  facts: [
    { key: "education", value: "B.Tech, Information Technology", sub: "Government College of Engineering, Erode · 8.04 CGPA" },
    { key: "rank", value: "2nd rank — Diploma in CSE", sub: "Rajaji Institute of Technology, Salem · 94%" },
    { key: "award", value: "2nd prize — Language Translator App", sub: "Project Expo, Government College of Engineering" },
    { key: "certifications", value: "Java · AI · Data Science", sub: "Infosys Springboard · Oracle Academy · Walmart + MIT" },
  ],

  mapSkills: ["Python", "LangChain", "RAG / Embeddings", "AI Agents", "MCP", "Tesseract OCR", "OpenCV", "Java · Spring Boot", "MySQL"],

  projects: [
    {
      name: "AgentBuilder",
      tag: "LLM agent framework",
      description:
        "Tool-calling agents for external services and REST APIs, MCP workflows for email, calendar, files and databases, plus RAG for context-aware answers.",
      points: [
        "Developed an LLM agent framework with tool-calling capabilities for external services and REST APIs.",
        "Integrated MCP-based workflows for email, calendar, file and database operations.",
        "Implemented RAG pipelines using embeddings and vector databases for context-aware responses.",
      ],
      uses: [["Python", 0.8], ["LangChain", 1], ["RAG / Embeddings", 0.9], ["AI Agents", 1], ["MCP", 0.9]],
    },
    {
      name: "Passport & ID Verification",
      tag: "Computer vision · OCR",
      description:
        "Extracts and validates passport and identity-card fields using image preprocessing, OCR and pattern-based validation.",
      points: [
        "Developed a document-processing system to extract and validate information from passports and identity cards.",
        "Applied image preprocessing and OCR techniques to improve document text extraction.",
        "Implemented pattern-based validation for extracted identity fields.",
      ],
      uses: [["Python", 0.9], ["Tesseract OCR", 1], ["OpenCV", 0.9]],
    },
    {
      name: "FurniCraft",
      tag: "Full-stack e-commerce",
      description:
        "Product catalog, search, shopping cart and order management, with backend services on Spring Boot and MySQL.",
      points: [
        "Developed product catalog, search, shopping cart and order management functionality.",
        "Implemented backend services and database operations using Spring Boot and MySQL.",
      ],
      uses: [["Java · Spring Boot", 1], ["MySQL", 0.9]],
    },
  ] as Project[],

  extraSkills: ["OpenAI API", "FastAPI", "Hugging Face", "Transformers", "Prompt Engineering", "Vector Databases", "NLP", "REST APIs", "SQL", "Git · GitHub", "Postman"],

  journey: [
    {
      label: "2021",
      kind: "education",
      dates: "2021 — 2023",
      title: "Diploma in Computer Science Engineering",
      org: "Rajaji Institute of Technology, Salem",
      points: ["Graduated with 94%.", "Secured Second Rank in the Diploma in Computer Science Engineering."],
      note: "foundations: programming · databases · computer science",
    },
    {
      label: "2023",
      kind: "education",
      dates: "2023 — 2026",
      title: "B.Tech in Information Technology",
      org: "Government College of Engineering, Erode",
      points: ["8.04 CGPA.", "Won Second Prize for a Language Translator App at the college Project Expo."],
      note: "certifications: Java (Infosys Springboard) · AI (Oracle Academy) · Data Science (Walmart + MIT)",
    },
    {
      label: "Jun 2025",
      kind: "internship",
      dates: "Jun 2025 — Jul 2025",
      title: "Full Stack Developer Intern",
      org: "Eagle HiTech Softclou Pvt. Ltd.",
      points: [
        "Developed an e-commerce application using Java, Spring Boot, MySQL, HTML, CSS and JavaScript.",
        "Implemented backend functionality, authentication and database operations.",
      ],
      note: "stack: Java · Spring Boot · MySQL · HTML · CSS · JavaScript",
    },
    {
      label: "Aug 2025",
      kind: "work",
      dates: "Aug 2025 — Present",
      title: "AI/ML Developer",
      org: "HeroApps, London (Remote)",
      points: [
        "Develop Python-based AI applications using LLMs, OpenAI APIs and LangChain.",
        "Build RAG pipelines using embeddings and vector databases for context-aware information retrieval.",
        "Integrate AI capabilities into backend workflows using FastAPI and APIs.",
        "Develop prompt-based workflows for text processing, summarization and intelligent automation.",
        "Build AI agent workflows using tool calling and modular components.",
      ],
      note: "stack: Python · LangChain · OpenAI API · FastAPI · vector databases",
    },
  ] as Checkpoint[],

  contactChips: ["Hire me for an AI project", "Talk about RAG & agents", "Full-time role"],
};
