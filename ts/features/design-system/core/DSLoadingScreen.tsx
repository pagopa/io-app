import { Body } from "@pagopa/io-app-design-system";
import LoadingScreenContent from "../../../components/screens/LoadingScreenContent";

const DSLoadingScreen = () => (
  <LoadingScreenContent headerVisible contentTitle={"Loading…"}>
    <Body>This is a subtitle</Body>
  </LoadingScreenContent>
);

export { DSLoadingScreen };
