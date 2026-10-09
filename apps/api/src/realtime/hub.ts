import type { WebSocket } from "ws";

interface ClientConnection {
  socket: WebSocket;
  tenantId: string;
  channel: "kds" | "order";
  orderId?: string;
}

export class RealtimeHub {
  private clients: Set<ClientConnection> = new Set();

  register(connection: ClientConnection) {
    this.clients.add(connection);

    connection.socket.on("close", () => {
      this.clients.delete(connection);
    });

    connection.socket.on("error", () => {
      this.clients.delete(connection);
    });
  }

  /**
   * Broadcast an event to all staff KDS displays for a specific tenant
   */
  broadcastToKds(tenantId: string, event: unknown) {
    const payload = JSON.stringify(event);
    for (const client of this.clients) {
      if (
        client.tenantId === tenantId &&
        client.channel === "kds" &&
        client.socket.readyState === 1 // OPEN
      ) {
        client.socket.send(payload);
      }
    }
  }

  /**
   * Broadcast an order status update to a specific customer tracking their order
   */
  broadcastToOrder(orderId: string, event: unknown) {
    const payload = JSON.stringify(event);
    for (const client of this.clients) {
      if (
        client.channel === "order" &&
        client.orderId === orderId &&
        client.socket.readyState === 1
      ) {
        client.socket.send(payload);
      }
    }
  }
}

export const realtimeHub = new RealtimeHub();
