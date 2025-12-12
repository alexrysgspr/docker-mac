# Azure Service Bus Explorer - Setup Guide

## 🎉 Complete Setup

Your Next.js Service Bus Explorer is now ready! Here's what has been created:

## 📁 Project Structure

```
docker/
├── docker-compose.yml (UPDATED - includes servicebus-explorer)
└── servicebus-explorer/
    ├── app/
    │   ├── api/
    │   │   ├── queues/route.ts
    │   │   ├── topics/route.ts
    │   │   ├── subscriptions/route.ts
    │   │   └── messages/route.ts
    │   ├── components/
    │   │   ├── QueueList.tsx
    │   │   ├── TopicList.tsx
    │   │   └── MessagePanel.tsx
    │   ├── layout.tsx
    │   ├── page.tsx
    │   └── globals.css
    ├── lib/
    │   └── serviceBusClient.ts
    ├── public/
    ├── Dockerfile
    ├── .dockerignore
    ├── .gitignore
    ├── next.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── tsconfig.json
    ├── package.json
    └── README.md
```

## ✨ Features Implemented

### Queue Management
- ✅ List all queues with real-time metrics (active, total, DLQ counts)
- ✅ Create new queues
- ✅ Delete queues
- ✅ Auto-refresh every 5 seconds

### Topic & Subscription Management
- ✅ List all topics
- ✅ Create/delete topics
- ✅ List subscriptions per topic
- ✅ Create/delete subscriptions
- ✅ View subscription metrics

### Message Operations
- ✅ Peek messages (non-destructive view)
- ✅ Send messages to queues/topics
- ✅ Add custom application properties
- ✅ View full message details (body, properties, metadata)
- ✅ Purge all messages
- ✅ Display message ID, sequence number, delivery count

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

1. **Build and start all services:**
   ```bash
   cd /Users/alexrysgspr/Projects/docker
   docker-compose up -d servicebus-explorer
   ```

2. **Access the Service Bus Explorer:**
   - Open your browser to: http://localhost:3000

3. **View logs:**
   ```bash
   docker-compose logs -f servicebus-explorer
   ```

### Option 2: Development Mode

1. **Install dependencies:**
   ```bash
   cd /Users/alexrysgspr/Projects/docker/servicebus-explorer
   npm install
   ```

2. **Set environment variable:**
   ```bash
   export SERVICE_BUS_CONNECTION_STRING="Endpoint=sb://localhost;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=SAS_KEY_VALUE;UseDevelopmentEmulator=true;"
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Access at:** http://localhost:3000

## 🐳 Docker Commands

```bash
# Build the image
docker-compose build servicebus-explorer

# Start the service
docker-compose up -d servicebus-explorer

# Stop the service
docker-compose stop servicebus-explorer

# View logs
docker-compose logs -f servicebus-explorer

# Restart the service
docker-compose restart servicebus-explorer

# Remove the service
docker-compose down servicebus-explorer
```

## 📋 Usage Guide

### Creating a Queue
1. Click on the "Queues" tab
2. Click "+ New" button
3. Enter queue name
4. Click "Create"

### Sending a Message
1. Select a queue or subscription
2. Click "Send Message" button
3. Enter message body (can be plain text or JSON)
4. Optionally add properties in JSON format: `{"key": "value"}`
5. Click "Send"

### Viewing Messages
1. Select a queue or subscription
2. Messages appear in the left panel
3. Click on a message to view details in the right panel
4. Click "Refresh" to update the list

### Managing Topics & Subscriptions
1. Click on the "Topics" tab
2. Create a topic using "+ New"
3. Select the topic to view its subscriptions
4. Create subscriptions for the selected topic
5. Select a subscription to view its messages

## 🔧 Configuration

### Environment Variables

The application uses the following environment variable:

- `SERVICE_BUS_CONNECTION_STRING`: Connection to Azure Service Bus Emulator
  - For Docker: `Endpoint=sb://servicebus-emulator;...` (NO PORT NUMBER!)
  - For local dev: `Endpoint=sb://localhost;...` (NO PORT NUMBER!)

### Connection String Format

**IMPORTANT**: Do NOT include the port number in the connection string for the emulator!

```
Endpoint=sb://[HOST];SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=SAS_KEY_VALUE;UseDevelopmentEmulator=true;
```

**Correct formats:**
- For Docker containers on same network: `Endpoint=sb://servicebus-emulator;...`
- For local development: `Endpoint=sb://localhost;...`
- For different bridge network: `Endpoint=sb://host.docker.internal;...`

**Note**: The port (5672) is NOT included in the connection string.

## 🏗️ Architecture

### Frontend (React/Next.js)
- **App Router**: Next.js 15 App Router for routing
- **Components**: Modular React components with TypeScript
- **Styling**: Tailwind CSS for responsive design
- **State Management**: React hooks (useState, useEffect)
- **Auto-refresh**: Polling every 5 seconds for live updates

### Backend (API Routes)
- **Next.js API Routes**: RESTful endpoints
- **Azure SDK**: @azure/service-bus for Service Bus operations
- **Operations**: CRUD for queues, topics, subscriptions, messages

### Docker
- **Multi-stage build**: Optimized for production
- **Standalone output**: Next.js standalone mode
- **Network**: Connected to local-net with other services

## 🎨 UI Features

- **Responsive Design**: Works on desktop and mobile
- **Real-time Updates**: Auto-refresh for metrics
- **Color Coding**: Visual indicators for selected items
- **Message Details**: Full message inspection panel
- **Error Handling**: User-friendly error messages

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/queues` | GET | List all queues |
| `/api/queues` | POST | Create a queue |
| `/api/queues?name=X` | DELETE | Delete a queue |
| `/api/topics` | GET | List all topics |
| `/api/topics` | POST | Create a topic |
| `/api/topics?name=X` | DELETE | Delete a topic |
| `/api/subscriptions?topic=X` | GET | List subscriptions |
| `/api/subscriptions` | POST | Create subscription |
| `/api/subscriptions?topic=X&name=Y` | DELETE | Delete subscription |
| `/api/messages` | GET | Peek messages |
| `/api/messages` | POST | Send message |
| `/api/messages?...&purgeAll=true` | DELETE | Purge messages |

## 🔍 Troubleshooting

### Service Bus Connection Issues
- Ensure `servicebus-emulator` is running: `docker-compose ps`
- Check connection string in docker-compose.yml
- Verify network connectivity: `docker network inspect docker_local-net`

### Build Issues
- Clear Next.js cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Rebuild Docker image: `docker-compose build --no-cache servicebus-explorer`

### Port Conflicts
- Check if port 3000 is available: `lsof -i :3000`
- Change port in docker-compose.yml if needed

## 🚢 Production Deployment

The application is production-ready with:
- ✅ Optimized builds (Next.js standalone mode)
- ✅ Multi-stage Docker builds
- ✅ Error handling and validation
- ✅ TypeScript for type safety
- ✅ ESLint configuration
- ✅ Health checks ready to implement

## 📝 Next Steps

1. **Start the application:**
   ```bash
   docker-compose up -d servicebus-explorer
   ```

2. **Create your first queue:**
   - Visit http://localhost:3000
   - Click "Queues" → "+ New"
   - Enter name "test-queue"

3. **Send a test message:**
   - Select the queue
   - Click "Send Message"
   - Enter any text and click "Send"

4. **View the message:**
   - Message appears in the list
   - Click to view details

## 🎓 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Azure Service Bus Documentation](https://learn.microsoft.com/en-us/azure/service-bus-messaging/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

Enjoy your new Service Bus Explorer! 🎊
