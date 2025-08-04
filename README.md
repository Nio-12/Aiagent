# AI Chatbot

A simple web-based chatbot built with HTML, CSS, and JavaScript using fixed responses.

## Features

- **Modern UI Design**: Beautiful gradient design with smooth animations
- **Real-time Chat Interface**: User-friendly chat interface with message bubbles
- **Typing Indicators**: Shows when the bot is "thinking" with animated dots
- **Responsive Design**: Works on desktop and mobile devices
- **Fixed Bot Responses**: Pre-programmed responses for common questions
- **Auto-scroll**: Automatically scrolls to the latest message
- **Keyboard Support**: Press Enter to send messages

## How to Use

1. Open `index.html` in any modern web browser
2. Type your message in the input field
3. Press Enter or click the "Send" button
4. The bot will respond with pre-programmed answers

## Bot Responses

The chatbot can respond to various keywords and phrases:

- **Greetings**: "hello", "hi"
- **Personal Questions**: "how are you", "what is your name"
- **Help Requests**: "help"
- **Farewell**: "bye"
- **Gratitude**: "thanks", "thank you"
- **Information Requests**: "weather", "time"
- **Entertainment**: "joke"
- **General Questions**: "what can you do", "who are you", "how do you work"

## File Structure

```
Aiagent/
├── index.html          # Main chatbot application
└── README.md          # This file
```

## Customization

To add more responses, edit the `botResponses` object in the JavaScript section of `index.html`:

```javascript
this.botResponses = {
    'your keyword': 'Your response here',
    // Add more responses...
};
```

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Future Enhancements

- Integration with real AI APIs
- Voice input/output
- File sharing capabilities
- User authentication
- Conversation history storage 