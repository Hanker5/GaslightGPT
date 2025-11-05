# GaslightGPT

A lightweight web application for experimenting with OpenAI's ChatGPT API integration. This project features a simple chat interface with a Node.js backend for secure API communication.

This repository contains:
- **Frontend**: Web UI (`index.html`, `front-end.js`, `style.css`)
- **Backend**: Node.js server in `chatgpt-chat/` directory

## Prerequisites

- Node.js (v14 or higher recommended)
- An OpenAI API key ([get one here](https://platform.openai.com/api-keys))

## Quick start (Windows / PowerShell)

1. Copy `.env.example` to `.env` and fill in the required variables:

```powershell
cp .env.example .env
# then edit .env in your editor and paste real values (OPENAI_API_KEY & PORT)
```

2. Install dependencies for the backend (if using the `chatgpt-chat` folder):

```powershell
cd chatgpt-chat
npm install
```

3. Start the server:

```powershell
# from repo root
cd chatgpt-chat
npm start
```

The server will start on the port specified in your `.env` file (default: 3000).

4. Open `index.html` in your browser. The frontend will connect to your local server at `http://localhost:PORT`.

## Usage

Once the server is running:
1. Open [index.html](index.html) in your web browser
2. Type your message in the chat input
3. Press Enter or click Send to interact with ChatGPT
4. Your conversation history is maintained during the session

## Environment & secrets

- Never commit your `.env` to the repository. `.env.example` contains placeholder names only.
- For CI (GitHub Actions) add your secrets in the repository Settings → Secrets → Actions.

## Troubleshooting

**Server won't start:**
- Ensure all dependencies are installed (`npm install` in `chatgpt-chat/`)
- Check that your `.env` file exists and contains valid values
- Verify the PORT is not already in use

**Can't connect to OpenAI:**
- Verify your `OPENAI_API_KEY` is correct and active
- Check your internet connection
- Ensure you have API credits available in your OpenAI account

**Frontend not connecting:**
- Confirm the PORT in your `.env` matches the port in your frontend code
- Check browser console for connection errors

## Project Structure

```
GaslightGPT/
├── chatgpt-chat/          # Backend server
│   ├── server.js          # Express server with OpenAI integration
│   ├── package.json       # Backend dependencies
│   └── .env               # Environment variables (not in repo)
├── index.html             # Main HTML page
├── front-end.js           # Client-side JavaScript
├── style.css              # Styling
├── .env.example           # Template for environment variables
└── README.md              # This file
```

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
