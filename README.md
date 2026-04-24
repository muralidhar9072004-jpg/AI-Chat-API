# AI Chat Assistant - Backend API

Backend API for AI Chat Assistant built with Node.js, Express.js, MongoDB, and Google Gemini API.

## Features

- AI chat response generation
- Conversation memory with summary
- Chat history storage in MongoDB
- Clear chat functionality
- REST API endpoints
- Deployed on Render

## Tech Stack

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- Google Gemini API
- Render

## Frontend Repository

[https://github.com/yourusername/AI-Chat-UI](https://github.com/muralidhar9072004-jpg/AI-Chat-UI)

## API Endpoints
https://ai-chat-api-84vl.onrender.com/chat
https://ai-chat-api-84vl.onrender.com/history/${userId}
https://ai-chat-api-84vl.onrender.com/clear-chat


## Run Locally

npm install
server.js


### POST /chat

Send user message and get AI reply.

Request Body:

```json
{
  "userId": "murali99",
  "message": "Hello"
}


