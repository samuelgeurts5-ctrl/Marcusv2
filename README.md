# Marcus — Llama Training Studio

A GitHub Pages control panel for teaching, dataset curation, evaluation, and exporting a fine-tuning dataset.

## Features
- Teaching memories stored in this browser
- Prompt/ideal-answer training examples
- Optional Groq helper to draft examples and evaluate answers
- Connect to a separately hosted OpenAI-compatible Llama endpoint
- Export JSONL, CSV, JSON backup, and a source ZIP
- Import Marcus data from a backup ZIP

## Browser Llama
The site can load `Llama-3.1-8B-Instruct-q4f16_1-MLC` using WebLLM and WebGPU directly in a compatible browser. Click **Load Llama in this browser** in Model connection. The first load downloads several GB of model assets and requires a compatible browser/device with WebGPU and sufficient memory. Support varies; if it fails, try a current Chromium-based browser on a supported computer. The model is downloaded from its model host and may be cached by the browser; it is not stored in this repository. An optional OpenAI-compatible endpoint remains available as a fallback.

Groq can help prepare and evaluate examples; it does not fine-tune Llama model weights. The JSONL export is training data, not a trained model. Actual fine-tuning requires a separate provider or GPU environment that supports the selected model.

## API key safety
This is a public static website. Keys entered here are held in browser session storage and sent to their respective APIs; anyone with access to the browser session could use them. Do not use valuable or production keys here. Keys are excluded from ZIP/data exports.

## Data
Memories, examples, evaluations, and model endpoint settings are stored in localStorage for this browser. Export a backup before clearing browser data.