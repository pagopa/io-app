import {
  QueryClient,
  QueryClientProvider,
  onlineManager,
  focusManager,
  NotifyOnChangeProps
} from "@tanstack/react-query";
import NetInfo from "@react-native-community/netinfo";
import React from "react";
import { AppState, AppStateStatus } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Reactotron from "reactotron-react-native";
import {
  QueryClientManager,
  reactotronReactQuery
} from "reactotron-react-query";

// flipper plugin https://github.com/bgaleotti/react-query-native-devtools
// reactotron plugin https://github.com/hsndmr/reactotron-react-query

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      notifyOnChangeProps: ["data", "error"]
    },
    mutations: {}
  }
});

onlineManager.setEventListener(setOnline =>
  NetInfo.addEventListener(state => {
    setOnline(!!state.isConnected);
  })
);

function setupFlipperDevtools() {
  void import("react-query-native-devtools").then(({ addPlugin }) => {
    addPlugin({ queryClient });
  });
}

function setupReactotronDevtools() {
  const queryClientManager = new QueryClientManager({
    queryClient
  });
  Reactotron.use(reactotronReactQuery(queryClientManager))
    .configure({
      onDisconnect: () => {
        queryClientManager.unsubscribe();
      }
    })
    .useReactNative()
    .connect();
}

if (__DEV__) {
  setupFlipperDevtools();
  setupReactotronDevtools();
}

export function ReactQueryProvider({
  children
}: {
  children: React.ReactNode;
}) {
  React.useEffect(() => {
    const onAppStateChange = (status: AppStateStatus) => {
      focusManager.setFocused(status === "active");
    };
    const subscription = AppState.addEventListener("change", onAppStateChange);
    return () => subscription.remove();
  }, []);
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

/** https://tanstack.com/query/latest/docs/framework/react/react-native#refresh-on-screen-focus */
export function useRefreshOnFocus<T>(refetch: () => Promise<T>) {
  const firstTimeRef = React.useRef(true);
  useFocusEffect(
    React.useCallback(() => {
      if (firstTimeRef.current) {
        // eslint-disable-next-line functional/immutable-data
        firstTimeRef.current = false;
        return;
      }
      void refetch();
    }, [refetch])
  );
}

function useFocusedRef() {
  const focusedRef = React.useRef(true);
  useFocusEffect(
    React.useCallback(() => {
      // eslint-disable-next-line functional/immutable-data
      focusedRef.current = true;
      return () => {
        // eslint-disable-next-line functional/immutable-data
        focusedRef.current = false;
      };
    }, [])
  );
  return focusedRef;
}

/** https://tanstack.com/query/latest/docs/framework/react/react-native#disable-re-renders-on-out-of-focus-screens */
export function useFocusNotifyOnChangeProps(
  notifyOnChangeProps?: NotifyOnChangeProps
) {
  const focusedRef = useFocusedRef();
  return () => {
    if (!focusedRef.current) {
      return [];
    }
    if (typeof notifyOnChangeProps === "function") {
      return notifyOnChangeProps();
    }
    return notifyOnChangeProps;
  };
}

/** https://tanstack.com/query/latest/docs/framework/react/react-native#disable-queries-on-out-of-focus-screens */
export function useQueryFocusAware(notifyOnChangeProps?: NotifyOnChangeProps) {
  const focusedRef = useFocusedRef();
  return () => focusedRef.current;
}
