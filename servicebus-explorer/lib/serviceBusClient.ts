import {
  ServiceBusClient,
  ServiceBusAdministrationClient,
} from "@azure/service-bus";
import { AzureNamedKeyCredential } from "@azure/core-auth";

const connectionString =
  process.env.SERVICE_BUS_CONNECTION_STRING ||
  "Endpoint=sb://localhost:5672;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=SAS_KEY_VALUE;UseDevelopmentEmulator=true;";

const isEmulator = connectionString.includes("UseDevelopmentEmulator=true");

function getEmulatorAdminClient() {
  // Derive host from Endpoint=sb://host[:port]
  const endpointMatch = /Endpoint=sb:\/\/([^;]+);/.exec(connectionString);
  const hostWithPort = endpointMatch?.[1] ?? "localhost";
  const host = hostWithPort.split(":")[0];

  const sasMatch = /SharedAccessKeyName=([^;]+);SharedAccessKey=([^;]+)/.exec(
    connectionString
  );

  if (!sasMatch) {
    throw new Error(
      "Invalid Service Bus emulator connection string for admin client"
    );
  }

  const [, keyName, key] = sasMatch;
  const credential = new AzureNamedKeyCredential(keyName, key);
  const adminEndpoint = `http://${host}:5300/`;

  return new ServiceBusAdministrationClient(adminEndpoint, credential, {
    allowInsecureConnection: true,
  });
}

export function getServiceBusClient() {
  return new ServiceBusClient(connectionString);
}

export function getServiceBusAdminClient() {
  if (isEmulator) {
    return getEmulatorAdminClient();
  }

  return new ServiceBusAdministrationClient(connectionString);
}
