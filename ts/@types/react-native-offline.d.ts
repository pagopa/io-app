declare module "react-native-offline" {
  export function reducer<T>(state: T | undefined, action: any): T;

  interface NetworkEventsListenerSagaArguments {
    timeout?: number;
    pingServerUrl?: string;
    withExtraHeadRequest?: boolean;
    checkConnectionInterval?: number;
  }

  export function* networkEventsListenerSaga<A, B, C>(
    args: NetworkEventsListenerSagaArguments
  ): Generator<A, B, C>;
}
