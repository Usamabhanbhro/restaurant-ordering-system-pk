import Fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import sensible from "@fastify/sensible";
import websocket from "@fastify/websocket";
import { realtimeHub } from "./realtime/hub.js";
import {
  ORDER_STATUS,
  PAYMENT_CLAIM_STATUS,
  OrderCreateInputSchema,
  PaymentClaimSubmitSchema,
  CashierConfirmInputSchema,
  CashierRejectInputSchema,
} from "@queueless/types";

export function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || "info",
    },
  });

  // Plugins
  app.register(cors, {
    origin: true,
    credentials: true,
  });
  app.register(sensible);
  app.register(websocket);

  // Healthcheck Route
  app.get("/health", async () => {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "queueless-api",
      version: "0.1.0",
    };
  });

  // Public Menu Route (Stale-while-revalidate caching)
  app.get("/api/v1/menu/:tenantSlug", async (request, reply) => {
    const { tenantSlug } = request.params as { tenantSlug: string };
    reply.header("Cache-Control", "public, max-age=60, stale-while-revalidate=300");

    return {
      tenantSlug,
      operatingHours: "08:00 - 22:00",
      venueMode: "COUNTER_PICKUP",
      isOrderingPaused: false,
      categories: [
        { id: "cat-popular", nameEn: "Popular", nameUrdu: "Mashhoor", iconName: "Flame", sortOrder: 1 },
        { id: "cat-burgers", nameEn: "Burgers", nameUrdu: "Burger", iconName: "Utensils", sortOrder: 2 },
        { id: "cat-coffee", nameEn: "Specialty Coffee", nameUrdu: "Khaas Coffee", iconName: "Coffee", sortOrder: 3 },
      ],
      items: [
        {
          id: "item-smash-burger",
          nameEn: "Double Smash Burger",
          nameUrdu: "Double Smash Burger • Ziada Cheese",
          portionWeightGrams: 240,
          pricePkr: 890,
          prepTimeMinutes: 6,
          isAvailable: true,
          modifierGroups: [],
        },
        {
          id: "item-iced-latte",
          nameEn: "Spanish Iced Latte",
          nameUrdu: "Spanish Iced Latte",
          portionWeightGrams: 350,
          pricePkr: 580,
          prepTimeMinutes: 4,
          isAvailable: true,
          modifierGroups: [],
        },
      ],
    };
  });

  // Customer Order Placement Route
  app.post("/api/v1/orders", async (request, reply) => {
    const parseResult = OrderCreateInputSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.code(422).send({
        statusCode: 422,
        error: "Unprocessable Entity",
        message: "Invalid order payload",
        details: parseResult.error.format(),
      });
    }

    const { tenantId, pickupSlot, items, orderNotes } = parseResult.data;
    const orderNumber = Math.floor(100 + Math.random() * 900);
    const subtotalPkr = items.reduce((acc, it) => acc + 890 * it.quantity, 0);

    const newOrder = {
      id: crypto.randomUUID(),
      orderNumber,
      tenantId,
      customerRef: crypto.randomUUID(),
      customerDisplayName: "Diner",
      pickupSlot,
      state: ORDER_STATUS.PENDING_PAYMENT,
      subtotalPkr,
      discountPkr: 0,
      totalPkr: subtotalPkr,
      kitchenStartAt: null,
      readyAt: null,
      servedAt: null,
      voidedAt: null,
      items: items.map((it) => ({
        id: crypto.randomUUID(),
        orderId: "",
        menuItemId: it.menuItemId,
        nameSnapshot: "Double Smash Burger",
        pricePkrSnapshot: 890,
        quantity: it.quantity,
        selectedModifiers: it.selectedModifiers,
        itemNotes: it.itemNotes || null,
      })),
      claim: null,
      createdAt: new Date().toISOString(),
    };

    return reply.code(201).send(newOrder);
  });

  // Payment Claim Submission
  app.post("/api/v1/orders/:id/claim", async (request, reply) => {
    const { id } = request.params as { id: string };
    const parseResult = PaymentClaimSubmitSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.code(422).send({
        statusCode: 422,
        error: "Unprocessable Entity",
        message: "Invalid payment claim payload",
        details: parseResult.error.format(),
      });
    }

    const claim = {
      id: crypto.randomUUID(),
      orderId: id,
      tenantId: crypto.randomUUID(),
      paymentMethod: parseResult.data.paymentMethod,
      claimedTxnId: parseResult.data.claimedTxnId,
      proofImageUrl: parseResult.data.proofImageUrl || null,
      status: PAYMENT_CLAIM_STATUS.UNVERIFIED,
      reviewedAt: null,
      reviewedByStaffId: null,
      undoExpiresAt: null,
      createdAt: new Date().toISOString(),
    };

    // Broadcast to KDS screen
    realtimeHub.broadcastToKds(claim.tenantId, {
      type: "CLAIM_SUBMITTED",
      claim,
    });

    return reply.code(200).send(claim);
  });

  // WebSockets: Staff KDS Channel
  app.register(async function (fastify) {
    fastify.get("/ws/kds/:tenantId", { websocket: true }, (socket, req) => {
      const { tenantId } = req.params as { tenantId: string };
      realtimeHub.register({
        socket,
        tenantId,
        channel: "kds",
      });
    });

    // WebSockets: Diner Order Progress Channel
    fastify.get("/ws/orders/:orderId", { websocket: true }, (socket, req) => {
      const { orderId } = req.params as { orderId: string };
      realtimeHub.register({
        socket,
        tenantId: "",
        channel: "order",
        orderId,
      });
    });
  });

  return app;
}
