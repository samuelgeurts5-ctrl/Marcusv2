# Marcus — Personal Workspace

Marcus is a personal assistant workspace hosted as a static site.

## Working features

- Live chat using a Groq-compatible Chat Completions API.
- Model Manager for choosing a provider, model ID, and endpoint.
- Browser-only API key entry; the key is never written into the Git repository or exported workspace JSON.
- Model settings for temperature, Top-P, and maximum output tokens.
- Teaching Memory: explicit memory entries are included as context in future chats.
- Training Lab: prompt/ideal-answer examples are kept separate and included as reference examples; saving examples does **not** fine-tune or change model weights.
- Editable system prompt, JSON exports, theme toggle, and status dashboard.

## Connect a model

1. Open the published Marcus site and select **Model Manager**.
2. Select **Groq**.
3. Enter a currently supported model ID from your Groq console (the default suggestion is `llama-3.3-70b-versatile`).
4. Paste your API key into the password field and choose **Save connection**.
5. Choose **Test connection**. If it succeeds, open **Chat** and send a message.

The default endpoint is `https://api.groq.com/openai/v1/chat/completions`. You can set another OpenAI-compatible endpoint if appropriate for your provider.

## Security note

This first version calls the provider directly from the browser. The key is saved in that browser's localStorage, not in the repository. This is convenient for a personal prototype but is **not as secure as a backend**: anyone with access to your browser profile can inspect browser storage, and browser extensions or injected scripts could potentially access it. Use a low-limit test key, never share the browser profile, and revoke the key if exposed. For a public or multi-user deployment, replace direct browser calls with a backend that keeps secrets in server-side environment variables.

## Teaching vs training

- **Teaching** saves explicit memory entries and sends them as context to the model.
- **Training examples** save prompt/ideal-answer pairs and provide a small set as context examples.
- Neither action changes model weights. Real fine-tuning requires a compatible model and a separate training service.

## Hosting

GitHub Pages can host the frontend. The model provider must allow browser-origin requests; if the browser blocks a request due to CORS, a small backend proxy is required. Never put an API key directly in HTML, JavaScript, or a committed configuration file.
