import { NextResponse } from 'next/server';
import { getServiceBusAdminClient } from '@/lib/serviceBusClient';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const topicName = searchParams.get('topic');
    
    if (!topicName) {
      return NextResponse.json({ error: 'Topic name required' }, { status: 400 });
    }
    
    const adminClient = getServiceBusAdminClient();
    const subscriptions = [];
    
    for await (const subscription of adminClient.listSubscriptions(topicName)) {
      const runtimeInfo = await adminClient.getSubscriptionRuntimeProperties(topicName, subscription.subscriptionName);
      subscriptions.push({
        name: subscription.subscriptionName,
        messageCount: runtimeInfo.totalMessageCount,
        activeMessageCount: runtimeInfo.activeMessageCount,
        deadLetterMessageCount: runtimeInfo.deadLetterMessageCount,
        status: subscription.status,
      });
    }
    
    return NextResponse.json(subscriptions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { topicName, subscriptionName } = await request.json();
    const adminClient = getServiceBusAdminClient();
    
    await adminClient.createSubscription(topicName, subscriptionName);
    
    return NextResponse.json({ success: true, message: 'Subscription created' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const topicName = searchParams.get('topic');
    const subscriptionName = searchParams.get('name');
    
    if (!topicName || !subscriptionName) {
      return NextResponse.json({ error: 'Topic and subscription name required' }, { status: 400 });
    }
    
    const adminClient = getServiceBusAdminClient();
    await adminClient.deleteSubscription(topicName, subscriptionName);
    
    return NextResponse.json({ success: true, message: 'Subscription deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
