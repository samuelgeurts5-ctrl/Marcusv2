# Marcus Studio

Marcus Studio is the development workspace for building a **new Marcus assistant**. It is not the old terminal assistant and is not intended to be the final end-user assistant app.

## First version includes

- Overview dashboard
- Model manager with provider selection UI
- Generation settings: temperature, Top-P, Top-K, max output tokens, frequency/presence penalties, context length, streaming and memory toggles
- Memory Studio for explicit teaching entries
- Training Lab for prompt/ideal-answer dataset examples
- Chat Builder preview and editable system-prompt draft
- System Monitor with honest placeholders for metrics that require a backend
- Project settings and JSON exports
- Responsive layout and light/dark theme toggle

## Current limitations

- Settings, memories, training examples, provider choice and prompt draft are saved in this browser's localStorage.
- The UI does **not** call a real AI model yet.
- Saving Q&A examples does **not** train model weights.
- API keys are not accepted or stored in this frontend. Real provider calls should go through a backend with credentials stored server-side.
- Runtime metrics remain blank until a backend/model runtime reports real measurements.

## Run it

Open `index.html` in a browser, or serve the folder with a static web server. GitHub Pages can host the UI; a real model connection will require a backend service.

## Next development layer

1. Add a small backend API.
2. Add secure server-side provider configuration.
3. Connect the Chat Builder to real inference.
4. Store memories and datasets in a database instead of browser-only storage.
5. Add evaluation tools and, only if supported, a genuine fine-tuning workflow.
