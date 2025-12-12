# Azure Service Bus Explorer

A modern web-based Service Bus Explorer built with Next.js, TypeScript, and Tailwind CSS for managing Azure Service Bus entities in the emulator.

## Features

### Queue Management
- ✅ List all queues with real-time metrics
- ✅ Create new queues
- ✅ Delete queues
- ✅ View queue statistics (active, total, dead-letter message counts)

### Topic Management
- ✅ List all topics
- ✅ Create new topics
- ✅ Delete topics
- ✅ View topic subscription counts

### Subscription Management
- ✅ List all subscriptions for a topic
- ✅ Create new subscriptions
- ✅ Delete subscriptions
- ✅ View subscription statistics (active, total, dead-letter message counts)

### Message Management
- ✅ View messages in queues
- ✅ View messages in subscriptions
- ✅ Send messages to queues/topics
- ✅ Add custom message properties
- ✅ View message details (body, properties, metadata)
- ✅ Purge all messages
- ✅ Auto-refresh message lists

## Tech Stack

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **@azure/service-bus** SDK for Service Bus operations
- **Docker** for containerization

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Azure Service Bus Emulator running

### Development

1. Install dependencies:
```bash
cd servicebus-explorer
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

### Production with Docker

1. Build and run with Docker Compose:
```bash
cd ..
docker-compose up -d servicebus-explorer
```

2. Access the application at [http://localhost:3000](http://localhost:3000)

## Environment Variables

- `SERVICE_BUS_CONNECTION_STRING`: Connection string for Azure Service Bus Emulator
  - Default: `Endpoint=sb://servicebus-emulator:5672;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=SAS_KEY_VALUE;UseDevelopmentEmulator=true`

## Architecture

### Frontend
- **React Components**: Modular components for queues, topics, subscriptions, and messages
- **Client-side State**: React hooks for state management
- **Real-time Updates**: Auto-refresh every 5 seconds for entity lists

### Backend (API Routes)
- **`/api/queues`**: CRUD operations for queues
- **`/api/topics`**: CRUD operations for topics
- **`/api/subscriptions`**: CRUD operations for subscriptions
- **`/api/messages`**: Send, receive, peek, and purge messages

### Service Bus Integration
- Connection pooling for efficient resource usage
- Peek mode for non-destructive message viewing
- Receive and delete mode for purging

## Docker Deployment

The application uses a multi-stage Docker build:
1. **deps**: Install dependencies
2. **builder**: Build the Next.js application
3. **runner**: Production runtime with minimal footprint

## Usage

### Managing Queues
1. Click the "Queues" tab
2. Click "+ New" to create a queue
3. Select a queue to view its messages
4. Click "Delete" to remove a queue

### Managing Topics & Subscriptions
1. Click the "Topics" tab
2. Click "+ New" to create a topic
3. Select a topic to view its subscriptions
4. Click "+ New" in the subscriptions panel to create a subscription
5. Select a subscription to view its messages

### Working with Messages
1. Select a queue or subscription
2. Click "Send Message" to send a new message
3. Enter the message body and optional JSON properties
4. Click "Refresh" to update the message list
5. Click on a message to view its details
6. Click "Purge All" to delete all messages

## License

ISC
