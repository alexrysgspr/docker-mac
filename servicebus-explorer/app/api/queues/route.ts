import { NextResponse } from "next/server";
import { getServiceBusAdminClient } from "@/lib/serviceBusClient";

export async function GET() {
  try {
    const adminClient = getServiceBusAdminClient();
    const queues = [];

    for await (const queue of adminClient.listQueues()) {
      const runtimeInfo = await adminClient.getQueueRuntimeProperties(
        queue.name
      );
      queues.push({
        name: queue.name,
        messageCount: runtimeInfo.totalMessageCount,
        activeMessageCount: runtimeInfo.activeMessageCount,
        deadLetterMessageCount: runtimeInfo.deadLetterMessageCount,
        status: queue.status,
      });
    }

    return NextResponse.json(queues);
  } catch (error: any) {
    console.error("Error deleting queue:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { queueName } = await request.json();
    const adminClient = getServiceBusAdminClient();

    await adminClient.createQueue(queueName);

    return NextResponse.json({ success: true, message: "Queue created" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const queueName = searchParams.get("name");

    if (!queueName) {
      return NextResponse.json(
        { error: "Queue name required" },
        { status: 400 }
      );
    }

    const adminClient = getServiceBusAdminClient();
    await adminClient.deleteQueue(queueName);

    return NextResponse.json({ success: true, message: "Queue deleted" });
  } catch (error: any) {
    console.error("Error deleting queue:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
