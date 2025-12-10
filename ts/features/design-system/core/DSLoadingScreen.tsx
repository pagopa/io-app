import { Body } from "@pagopa/io-app-design-system";
import LoadingScreenContent from "../../../components/screens/LoadingScreenContent";

const DSLoadingScreen = () => (
  <LoadingScreenContent headerVisible title={"Loading…"}>
    <Body>This is a subtitle</Body>
  </LoadingScreenContent>
);

export { DSLoadingScreen };
