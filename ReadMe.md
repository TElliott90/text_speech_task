# Text to Speech Solution

A document-to-speech app built with React, TypeScript and Vite on the frontend, and NestJS on the backend. Upload a document, extract its text using Google Gemini, and generate an MP3 using ElevenLabs.

## How it works

1. Choose a document in the browser and click **Convert**.
2. The frontend uploads it to the NestJS API as multipart form data.
3. The backend sends the document content to Gemini for text extraction.
4. ElevenLabs converts the extracted text into speech.
5. The browser automatically downloads `Audio - <document name>.mp3`.

Uploaded files and generated audio are handled in memory; the app does not use a database or save uploads on the server. Document content is sent to Google, and extracted text is sent to ElevenLabs.

## Requirements

- Node.js 22.12.0 or later and npm.
- A Gemini API key with access to the model configured in the backend.
- An ElevenLabs API key with access to the configured speech model and voice.
- Network access to both services and available API quota.

The current backend uses Gemini `gemini-3.8-flash` and ElevenLabs `eleven_v3`. These values are set in [documents.service.ts](backend/src/documents/documents.service.ts); model and voice availability depend on your provider account.

## Local setup

Run the following commands from the repository root to install both applications:

```sh
npm --prefix backend ci
npm --prefix frontend ci
```

Create or update `backend/.env` with your credentials:

```dotenv
GEMINI_API_KEY=your_gemini_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
```

Create or update `frontend/.env` with the backend base URL, without a trailing slash:

```dotenv
VITE_API_ENDPOINT=http://localhost:3000
```

Keep API keys in the backend environment only. Variables prefixed with `VITE_` are included in the browser bundle. Both applications ignore `.env` files in Git.

Start the backend in one terminal:

```sh
cd backend
npm run start:dev
```

Start the frontend in another terminal:

```sh
cd frontend
npm run dev -- --port 5173 --strictPort
```

Open [http://localhost:5173](http://localhost:5173). The API listens on port `3000`, and its CORS configuration allows `http://localhost:5173`. Restart the relevant development server after changing environment variables.

## Using the app

Choose a short TXT or PDF document and click **Convert**. The button displays **Converting…** while the request runs, and the MP3 downloads when it finishes. Errors appear in a modal. Playback is through the downloaded file; the current page does not render an audio player.

The [example files folder](1.Example%20Files/) contains a sample PDF report and an MP3 output.

### Current limits

- One non-empty file per request, up to 10 MiB (`10 × 1024 × 1024` bytes).
- Accepted extensions: `.txt`, `.pdf`, `.doc` and `.docx`, checked case-insensitively.
- PDF content is sent to Gemini as a document. All other accepted formats are decoded as UTF-8 text. DOC and DOCX are accepted by validation but do not have a dedicated parser, so Word document extraction is not reliably supported; export to PDF or TXT first.
- Extracted text must be no more than 2,000 characters. Longer output is rejected, rather than split into multiple speech requests.
- Text extraction uses an AI model and may not reproduce the source exactly.
- The model, voice, API port and allowed frontend origin are configured in source code.

## Troubleshooting

- **Cannot reach the API:** check that both servers are running and `VITE_API_ENDPOINT` is `http://localhost:3000`.
- **CORS error:** use `http://localhost:5173` for the frontend, or update the allowed origin in `backend/src/main.ts`.
- **HTTP 400 during conversion:** check backend credentials, provider quota, and access to the configured models and voice. Try a short TXT file to isolate document-format issues. The backend also reports text exceeding 2,000 characters as a generic extraction failure.
- **HTTP 413:** reduce the document size to 10 MiB or less.
- **Word document produces poor results:** export it as PDF or TXT before uploading.
