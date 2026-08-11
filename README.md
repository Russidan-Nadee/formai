<div align="center">

# FormAI

**AI assistant that fills forms automatically.**

An agent that reads what you type, and prefills a shipment form for you. You only show up to confirm.

[Live demo](https://formai-self.vercel.app) · [Report an issue](https://github.com/Russidan-Nadee/formai/issues)

</div>

## Demo

![FormAI demo](.github/assets/demo.gif)

## How it works

1. **Tell the agent** — type what you're trying to ship, in plain text.
2. **It reads and decides** — the agent maps what you said onto the right fields, looking up countries, postcodes, and unit conversions along the way.
3. **You confirm** — check the prefilled form and send it, that's it.

## Features

- **Natural-language form filling** — describe a shipment in a sentence, get a filled-out form.
- **Tool-calling agent** — resolves country names, postcodes to city/state, and weight units through dedicated tools instead of guessing.
- **Multi-model fallback** — tries Gemini 2.5 Flash, then Flash Lite, then falls back to Groq's Llama 3.3 70B if a provider is rate-limited.
- **Sender profiles** — pick a saved profile and the agent already knows who's sending.
- **Bilingual UI** — English and Thai, including agent replies in the user's chosen language.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router) + [React 19](https://react.dev)
- [Vercel AI SDK](https://ai-sdk.dev) with [Gemini](https://ai.google.dev) and [Groq](https://groq.com) providers
- [Tailwind CSS 4](https://tailwindcss.com) + [Framer Motion](https://www.framer.com/motion/)
- [Gemini API](https://ai.google.dev) (Google AI Studio) — primary model, via the Vercel AI SDK
- [Groq API](https://groq.com) (Llama 3.3 70B) — fallback model when Gemini is rate-limited

## Getting started

Install dependencies:

```bash
npm install
```

Copy the environment template and fill in your keys:

```bash
cp .env.example .env
```

| Variable            | Description                                                                    |
| ------------------- | ------------------------------------------------------------------------------ |
| `GEMINI_API_KEY`    | Google AI Studio API key                                                       |
| `GROQ_API_KEY`      | Groq API key, used as a fallback model                                         |
| `GEONAMES_USERNAME` | [GeoNames](https://www.geonames.org/login) username, used for postcode lookups |

Open [http://localhost:3000](http://localhost:3000) to try it locally.
