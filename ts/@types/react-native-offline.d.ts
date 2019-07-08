declare module "react-native-offline" {
  export function reducer<T>(state: T | undefined, action: any): T;

  interface NetworkEventsListenerSagaArguments {
    pingTimeout?: number;
    pingServerUrl?: string;
    shouldPing?: boolean;
    pingInterval?: number;
  }

  export function* networkSaga<A, B, C>(
    args: NetworkEventsListenerSagaArguments
  ): Generator<A, B, C>;
}
