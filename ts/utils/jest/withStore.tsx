import { JSXElementConstructor } from "react";
import { createStore } from "redux";
import { Provider } from "react-redux";
import { appReducer } from "../../store/reducers";
import { applicationChangeState } from "../../store/actions/application";

/**
 * A HOC to provide the redux `Context`
 * @param Component the component to wrap
 * @returns The given `Component` wrapped with the redux `Provider`
 */
export function withStore<P extends Record<string, unknown>>(
  Component: JSXElementConstructor<P>
) {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);

  return (props: P) => (
    <Provider store={store}>
      <Component {...props} />
    </Provider>
  );
}
