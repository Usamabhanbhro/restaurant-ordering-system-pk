import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/index.js";

/**
 * Creates a Drizzle client instance for standard tenant runtime operations (app_runtime_user).
 * Must be wrapped with SET LOCAL app.current_tenant_id = ? during transaction blocks.
 */
export function createRuntimeDb(connectionString: string) {
  const queryClient = postgres(connectionString, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });
  return drizzle(queryClient, { schema });
}

/**
 * Creates a Drizzle client instance for isolated customer identity operations (app_identity_user).
 * Exclusively queries customers, email_verification_codes, and password_reset_tokens.
 */
export function createIdentityDb(connectionString: string) {
  const queryClient = postgres(connectionString, {
    max: 5,
    idle_timeout: 20,
    connect_timeout: 10,
  });
  return drizzle(queryClient, { schema });
}

export type Database = ReturnType<typeof createRuntimeDb>;
