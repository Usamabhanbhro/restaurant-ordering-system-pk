import type { ApiClient } from "./types";
import { MockApiClient } from "./mockClient";
import { HttpApiClient } from "./httpClient";

// Factory selecting adapter based on environment configuration
const useMockApi = process.env.NEXT_PUBLIC_USE_MOCK_API !== "false";

export const apiClient: ApiClient = useMockApi ? new MockApiClient() : new HttpApiClient();

export * from "./types";
export * from "./mockClient";
export * from "./httpClient";
