# Humanize.ai

A tool that rewrites AI-generated text to sound more human and pass AI detection tools.

## Features

- **Text Humanization**: Transforms AI-generated text to appear genuinely human-authored
- **Customizable Rewriting**: Adjust humanization strength and preserve original tone/style options
- **AI Detection**: Shows before/after scores from GPTZero to verify humanization effectiveness
- **Copy Output**: Easily copy rewritten text with a single click
- **Error Handling**: Graceful handling of API errors and input validation

## Technical Stack

- **Framework**: Next.js
- **Frontend**: React with inline CSS for styling
- **Backend**: Next.js API routes
- **AI Service**: OpenAI GPT-4.1 for rewriting
- **Detection Service**: GPTZero API for AI detection scores

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create an environment file:
   ```
   cp .env.local.example .env.local
   ```
4. Add your API keys to `.env.local`:
   - `OPENAI_API_KEY` - Get from [OpenAI](https://platform.openai.com/api-keys)
   - `GPTZERO_API_KEY` - Get from [GPTZero](https://gptzero.me)

5. Run the development server:
   ```
   npm run dev
   ```
6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Paste AI-generated text into the input box
2. (Optional) Adjust settings:
   - **Preserve tone/style**: Keep the original text's tone while humanizing
   - **Humanization Strength**: Choose between Light, Medium, or Strong humanization
3. Click "Humanize Text" button
4. View the rewritten text and AI detection scores
5. If the detection score is still high, click "Try Again" for more aggressive humanization
6. Copy the output text using the "Copy Output" button

## Deployment

This project is configured to deploy on Vercel. Pushing changes to the main branch will trigger automatic deployment.

## Environment Variables

- `OPENAI_API_KEY` (Required): Your OpenAI API key for the rewriting functionality
- `GPTZERO_API_KEY` (Required): Your GPTZero API key for AI detection scoring

## License

MIT