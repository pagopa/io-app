import { Body, H2, VSpacer, useIOTheme } from "@pagopa/io-app-design-system";
import { IOScrollView } from "../../../components/ui/IOScrollView";

export const DSIOScrollViewWithoutActions = () => {
  const theme = useIOTheme();

  return (
    <IOScrollView>
      <H2 color={theme["textHeading-default"]}>Start</H2>
      <VSpacer />
      {[...Array(50)].map((_el, i) => (
        <Body key={`body-${i}`}>Repeated text {i + 1}</Body>
      ))}
      <VSpacer />
      <H2 color={theme["textHeading-default"]}>End</H2>
    </IOScrollView>
  );
};
