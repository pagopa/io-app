import { NativeModule, requireNativeModule } from "expo";
import { Platform } from "react-native";

import type {
  HttpCallConfig,
  HttpClientResponse
} from "./ExpoHttpClient.types";

declare class ExpoHttpClientModule extends NativeModule {
  cancelAllRunningRequests(): Promise<void>;
  cancelRequestWithId(requestId: string): Promise<void>;
  deallocate(): Promise<void>;
  nativeRequest(config: HttpCallConfig): Promise<HttpClientResponse>;
  removeAllCookiesForDomain(domain: string): Promise<void>;
  setCookieForDomain(
    domain: string,
    path: string,
    name: string,
    value: string
  ): Promise<void>;
}

export type { ExpoHttpClientModule };

// The native module is implemented only for iOS and Android: it is not loaded elsewhere.
export default Platform.OS === "ios" || Platform.OS === "android"
  ? requireNativeModule<ExpoHttpClientModule>("ExpoHttpClient")
  : undefined;
