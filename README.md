# Marcus — Llama Training Studio

A GitHub Pages control panel for teaching, dataset curation, evaluation, and exporting a fine-tuning dataset.

## Features
- Teaching memories stored in this browser
- Prompt/ideal-answer training examples
- Optional Groq helper to draft examples and evaluate answers
- Chat with Llama hosted remotely through a Cloudflare Worker template
- Export JSONL, CSV, JSON backup, and a source ZIP
- Import Marcus data from a backup ZIP

## Website inference (remote)
The website does not load model weights into the browser. It sends chat requests to a separately deployed Cloudflare Worker, which calls Cloudflare Workers AI for remote inference. See `worker/README.md` for deployment steps. The endpoint must be set in **Model connection**. The hosted website can chat without downloading a model onto your laptop; chat messages are sent to the hosted service.

Groq can help prepare and evaluate examples; it does not fine-tune Llama model weights. The JSONL export is training data, not a trained model. Actual fine-tuning requires a separate provider or GPU environment that supports the selected model.

## API key safety
This is a public static website. Keys entered here are held in browser session storage and sent to their respective APIs; anyone with access to the browser session could use them. Do not use valuable or production keys here. Keys are excluded from ZIP/data exports.

## Data
Memories, examples, evaluations, and model endpoint settings are stored in localStorage for this browser. Export a backup before clearing browser data.