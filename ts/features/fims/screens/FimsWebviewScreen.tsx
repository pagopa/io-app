import * as React from "react";
import { constNull } from "fp-ts/lib/function";
import FimsWebView from "../components/FimsWebView";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { internalRouteNavigationSelector } from "../../../store/reducers/internalRouteNavigation";

const FimsWebviewScreen = () => {
  const dispatch = useIODispatch();
  const { params } = useIOSelector(internalRouteNavigationSelector);

  return <FimsWebView onWebviewClose={constNull} uri={params.url} />;
};
export default FimsWebviewScreen;
