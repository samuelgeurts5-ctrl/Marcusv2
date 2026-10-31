# Marcus — Llama Training Studio

A GitHub Pages control panel for teaching, dataset curation, evaluation, and exporting a fine-tuning dataset.

## Features
- Teaching memories stored in this browser
- Prompt/ideal-answer training examples
- Optional Groq helper to draft examples and evaluate answers
- Connect to a separately hosted OpenAI-compatible Llama endpoint
- Export JSONL, CSV, JSON backup, and a source ZIP
- Import Marcus data from a backup ZIP

## Important model distinction
This static site does not install or host Llama. Set up a separate hosted inference endpoint and configure its URL/model ID in Model connection. The endpoint must allow browser CORS requests. For production, use a backend to protect secrets.

Groq can help prepare and evaluate examples; it does not fine-tune Llama model weights. The JSONL export is training data, not a trained model. Actual fine-tuning requires a separate provider or GPU environment that supports the selected model.

## API key safety
This is a public static website. Keys entered here are held in browser session storage and sent to their respective APIs; anyone with access to the browser session could use them. Do not use valuable or production keys here. Keys are excluded from ZIP/data exports.

## Data
Memories, examples, evaluations, and model endpoint settings are stored in localStorage for this browser. Export a backup before clearing browser data.