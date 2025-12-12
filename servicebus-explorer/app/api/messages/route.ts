import { NextResponse } from 'next/server';
import { getServiceBusClient } from '@/lib/serviceBusClient';

export async function POST(request: Request) {
  try {
    const { entityType, entityName, subscriptionName, message, properties } = await request.json();
    
    const client = getServiceBusClient();
    const sender = client.createSender(entityName);
    
    const messageBody = {
      body: message,
      applicationProperties: properties || {},
    };
    
    await sender.sendMessages(messageBody);
    await sender.close();
    await client.close();
    
    return NextResponse.json({ success: true, message: 'Message sent' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entityType');
    const entityName = searchParams.get('entityName');
    const subscriptionName = searchParams.get('subscriptionName');
    const maxMessages = parseInt(searchParams.get('maxMessages') || '10');
    
    if (!entityType || !entityName) {
      return NextResponse.json({ error: 'Entity type and name required' }, { status: 400 });
    }
    
    const client = getServiceBusClient();
    let receiver;
    
    if (entityType === 'queue') {
      receiver = client.createReceiver(entityName, { receiveMode: 'peekLock' });
    } else if (entityType === 'subscription' && subscriptionName) {
      receiver = client.createReceiver(entityName, subscriptionName, { receiveMode: 'peekLock' });
    } else {
      return NextResponse.json({ error: 'Invalid entity type or missing subscription' }, { status: 400 });
    }
    
    const messages = await receiver.peekMessages(maxMessages);
    const formattedMessages = messages.map((msg: any) => ({
      messageId: msg.messageId,
      body: msg.body,
      properties: msg.applicationProperties,
      enqueuedTimeUtc: msg.enqueuedTimeUtc,
      sequenceNumber: msg.sequenceNumber,
      deliveryCount: msg.deliveryCount,
    }));
    
    await receiver.close();
    await client.close();
    
    return NextResponse.json(formattedMessages);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entityType');
    const entityName = searchParams.get('entityName');
    const subscriptionName = searchParams.get('subscriptionName');
    const purgeAll = searchParams.get('purgeAll') === 'true';
    
    if (!entityType || !entityName) {
      return NextResponse.json({ error: 'Entity type and name required' }, { status: 400 });
    }
    
    const client = getServiceBusClient();
    let receiver;
    
    if (entityType === 'queue') {
      receiver = client.createReceiver(entityName, { receiveMode: 'receiveAndDelete' });
    } else if (entityType === 'subscription' && subscriptionName) {
      receiver = client.createReceiver(entityName, subscriptionName, { receiveMode: 'receiveAndDelete' });
    } else {
      return NextResponse.json({ error: 'Invalid entity type or missing subscription' }, { status: 400 });
    }
    
    let deletedCount = 0;
    if (purgeAll) {
      let messages;
      do {
        messages = await receiver.receiveMessages(100, { maxWaitTimeInMs: 1000 });
        deletedCount += messages.length;
      } while (messages.length > 0);
    }
    
    await receiver.close();
    await client.close();
    
    return NextResponse.json({ success: true, deletedCount, message: `Deleted ${deletedCount} messages` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
