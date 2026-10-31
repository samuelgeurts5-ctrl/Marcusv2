# Marcus remote Llama API

This Worker runs Llama remotely using Cloudflare Workers AI. The website only sends chat messages to this endpoint; it does not download model weights or run inference on your laptop.

## Deploy it

1. Sign in to Cloudflare and open Workers & Pages.
2. Create a Worker named `marcus-llama-api`, or use Wrangler from a development environment with Node.js installed.
3. Copy `src/index.js` and `wrangler.toml` into the Worker project and deploy it with the AI binding enabled.
4. Set a secret named `MARCUS_API_SECRET` to a long random value in the Worker settings. Do not put this secret in GitHub.
5. Copy the Worker URL, then in Marcus > Model connection use:
   - Endpoint: `https://YOUR-WORKER.workers.dev/v1/chat/completions`
   - Model ID: `@cf/meta/llama-3.1-8b-instruct-fp8`
   - Model API key: the same secret value you set for `MARCUS_API_SECRET`
6. Save the connection and click Test endpoint.

## Notes

- Cloudflare hosts the model and performs inference remotely. This uses your Cloudflare Workers AI account and its usage limits/pricing; it is not guaranteed to be free.
- The endpoint checks a server secret and only accepts requests from the Marcus GitHub Pages origin (plus localhost for development).
- Never commit your secret to this public repository.
- This is a starting implementation. Review account usage, provider terms, and security settings before sharing the endpoint publicly.
