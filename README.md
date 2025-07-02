# Pure-Reviewed

A strategic content modification tool disguised as an academic writing assistant.

## What It Does

Pure-Reviewed helps you navigate institutional gatekeeping by making your writing appear more "acceptable" to various censors while preserving your core message. Think of it as a linguistic camouflage system.

**Context-Aware Processing**: Specify what you're writing for (NSF grant, Beijing art proposal, corporate report) and the tool adapts its strategy accordingly.

**Dual Control System**:
- **Ambiguity** (0-10): Makes sensitive language more vague/indirect
- **Noise** (0-10): Injects "conforming" content to mask your signal

**Word-Count Conscious**: Academic writing has limits. Pure-Reviewed uses replacement strategies rather than pure addition to maintain your constraints.

## Key Features

- **Ambiguity=0 Rule**: When set to 0, your text passes through completely unchanged
- **Strategic Noise**: Context-appropriate "aligned" language that masks without bloating
- **Institutional Mimicry**: Adapts to NSF, authoritarian, corporate, or academic contexts
- **Word Count Preservation**: Maintains length through smart replacements, not additions

## Quick Start

```bash
cd pure-reviewed-app
npm i
node server.js
```

Visit `http://localhost:3000`

## Deployment

Deploy to Vercel for secure API key storage:

```bash
vercel --prod
```

Set `OPENAI_API_KEY` in Vercel environment variables.

## Technical Details

- **Backend**: Node.js + Express + OpenAI GPT-4
- **Frontend**: Vanilla HTML/CSS/JS
- **Deployment**: Vercel serverless functions
- **Fallback**: Rule-based processing when API unavailable

## The Art Piece

Pure-Reviewed exists in the space between institutional compliance and authentic expression. It's a tool that helps you speak truth to power while appearing to speak power's language. The irony is intentional: a system designed to help you navigate censorship becomes a commentary on the necessity of such navigation.

Use it to write your feminist research proposals, your democracy advocacy, your radical art statements. Let the institutions think you're one of them while you say exactly what you mean.

---

*"The best camouflage doesn't hide you—it makes you look like something else entirely."*