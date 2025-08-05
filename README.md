# AI Chatbot

A web-based chatbot built with HTML, CSS, JavaScript frontend and Node.js backend with OpenAI API integration.

## Features

- **Modern UI Design**: Beautiful gradient design with smooth animations
- **Real-time Chat Interface**: User-friendly chat interface with message bubbles
- **Typing Indicators**: Shows when the bot is "thinking" with animated dots
- **Responsive Design**: Works on desktop and mobile devices
- **OpenAI Integration**: Real AI responses using GPT-3.5-turbo
- **Conversation History**: Maintains context across messages
- **Auto-scroll**: Automatically scrolls to the latest message
- **Keyboard Support**: Press Enter to send messages

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- OpenAI API key
- Supabase account and project

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - Copy `env.example` to `.env`
   - Add your API keys to the `.env` file:
     ```
     OPENAI_API_KEY=your_actual_openai_api_key_here
     SUPABASE_URL=your_supabase_project_url_here
     SUPABASE_ANON_KEY=your_supabase_anon_key_here
     PORT=3000
     ```

3. **Start the server:**
   ```bash
   npm start
   ```
   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

4. **Access the chatbot:**
   - Open your browser and go to `http://localhost:3000`
   - Start chatting with the AI!

## How to Use

1. Open `http://localhost:3000` in any modern web browser
2. Type your message in the input field
3. Press Enter or click the "Send" button
4. The AI will respond using OpenAI's GPT-3.5-turbo model

## Database Setup

You need to create a table named `conversations` in your Supabase project with the following columns:

- `id` (uuid, primary key)
- `created_at` (timestamp with time zone)
- `conversation_id` (text)
- `messages` (jsonb)

You can create this table using the Supabase dashboard or by running the following SQL:

```sql
CREATE TABLE conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    conversation_id TEXT NOT NULL,
    messages JSONB DEFAULT '[]'::jsonb
);
```

## API Endpoints

The backend provides the following API endpoints:

- `POST /api/chat` - Send a message and get AI response
- `GET /api/conversation/:sessionId` - Get conversation history
- `DELETE /api/conversation/:sessionId` - Clear conversation history
- `GET /api/health` - Health check endpoint

## Conversation Management

- Each chat session has a unique session ID
- Conversation history is stored in Supabase database (persistent)
- Context is preserved across messages for more coherent conversations
- Maximum of 10 messages kept in context to prevent token limits
- Conversations persist across server restarts

## File Structure

```
Aiagent/
├── index.html          # Frontend chatbot application
├── server.js           # Node.js backend server
├── package.json        # Node.js dependencies
├── env.example         # Environment variables template
├── .gitignore          # Git ignore rules
└── README.md          # This file
```

## Customization

### Backend Customization

To modify the AI behavior, edit the system message in `server.js`:

```javascript
{
    role: 'system',
    content: 'You are a helpful AI assistant. Be friendly, concise, and helpful in your responses.'
}
```

### Frontend Customization

To modify the UI, edit the CSS styles in `index.html`. The main classes are:
- `.chat-container` - Main chat window
- `.message` - Individual message styling
- `.chat-input` - Input field styling

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Future Enhancements

- Voice input/output capabilities
- File sharing and image processing
- User authentication and multiple user support
- Advanced conversation analytics
- Integration with other AI models 