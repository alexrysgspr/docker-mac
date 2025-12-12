import { NextResponse } from 'next/server';
import { getServiceBusAdminClient } from '@/lib/serviceBusClient';

export async function GET() {
  try {
    const adminClient = getServiceBusAdminClient();
    const topics = [];
    
    for await (const topic of adminClient.listTopics()) {
      topics.push({
        name: topic.name,
        status: topic.status,
        subscriptionCount: 0,
      });
    }
    
    return NextResponse.json(topics);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { topicName } = await request.json();
    const adminClient = getServiceBusAdminClient();
    
    await adminClient.createTopic(topicName);
    
    return NextResponse.json({ success: true, message: 'Topic created' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const topicName = searchParams.get('name');
    
    if (!topicName) {
      return NextResponse.json({ error: 'Topic name required' }, { status: 400 });
    }
    
    const adminClient = getServiceBusAdminClient();
    await adminClient.deleteTopic(topicName);
    
    return NextResponse.json({ success: true, message: 'Topic deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
