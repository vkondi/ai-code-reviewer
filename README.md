# AI Code Reviewer

An AI-powered code review application that uses Deepseek AI to analyze and suggest improvements for your code.

## Features

- Support for multiple programming languages (auto-detection and manual selection)
- Real-time code editing with Monaco Editor
- AI-powered code review and refactoring suggestions
- Modern UI with dark and light themes (toggleable)
- Automatic language detection as you type or paste code
- Copy-to-clipboard functionality for refactored code

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Deepseek AI API key

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory and add your Deepseek AI API key:
   ```
   VITE_DEEPSEEK_API_KEY=your_api_key_here
   ```
   _Note: The API key is loaded from the environment for secure access to Deepseek AI._

## Development

To start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Usage

1. Paste your code into the editor (the app will try to auto-detect the language)
2. Optionally, select the programming language from the dropdown menu
3. Click the "Review Code" button
4. Wait for the AI to analyze your code
5. Review the suggestions and refactored code
6. Use the "Copy Code" button to copy the refactored code to your clipboard
7. Use the floating theme toggle button in the bottom-right corner to switch between light and dark modes

## Technologies Used

- React
- TypeScript
- Vite
- Material-UI
- Monaco Editor
- Deepseek AI API

## License

MIT
