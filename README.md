# Node.js - Express.js - JWT Refresh Token & WebSocket 🚀

## Features ✨

- **Node.js**: Server-side JavaScript runtime. 🖥️
- **Express.js**: Web framework for Node.js. 🌐
- **JWT (JSON Web Tokens)**: Stateless authentication mechanism. 🛡️
- **Refresh Tokens**: Mechanism to refresh JWT tokens without requiring the user to re-authenticate. 🔄
- **Websocket**: Realtime note app. 🔄
- **Cron Job**: Scheduler for periodic tasks in the application. ⏲️
- **Request Validation**: Ensures incoming request data adheres to expected formats using Zod. ✔️

### What is Refresh Token? 🤔

- A refresh token is a special kind of token that can be used to obtain a new access token after the access token has
  expired.
- Refresh tokens are long-lived, and they can be used to refresh the access token without requiring the user to
  re-authenticate.
- This mechanism improves the user experience by preventing the user from having to log in again after the access token
  expires.

## Installation 🛠️

1. Clone the repository:

   ```bash
   git clone https://github.com/Mamunahmedbd/realtime-note-app.git
   cd realtime-note-app
   ```

2. Install dependencies:

   ```bash
   cd frontend
   cd backend
   npm install
   ```

3. Create a `.env` file in frontend the root directory and add the following environment variables:

   ```plaintext
       NEXT_PUBLIC_API_RESOURCE=http://localhost:5000/api
       NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
       JWT_SECRET="9920ae823f6a74a75713f26e159d38f5e2b9dcce54dcb98de52131a02165b44f"
   ```

4. Create a `.env` file in backend the root directory and add the following environment variables:

   ```plaintext
       PORT=5000
       JWT_SECRET_AT="9920ae823f6a74a75713f26e159d38f5e2b9dcce54dcb98de52131a02165b44f"
       JWT_SECRET_RT="db0ec2d468b0abdb2d9ba6376807ea1480e06722dc8b53cff97785fe120fc02e"

       DATABASE_URL="mongodb://localhost:27017/realtime-note"
       NODE_ENV=development
       ACCESS_TOKEN_EXPIRES_IN=1000
       REFRESH_TOKEN_EXPIRES_IN=2000

   ```

5. Start the server:
   ```bash
   cd backend - npm dev
   cd frontend - npm dev
   ```
