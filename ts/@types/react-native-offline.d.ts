declare module "react-native-offline" {
  export type NetworkState = {
    isConnected: boolean;
    actionQueue: Array<any>;
  };

  export function reducer(state: NetworkState, action: any): NetworkState;

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
