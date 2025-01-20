import {
  Body,
  ContentWrapper,
  H3,
  VSpacer,
  useIOTheme
} from "@pagopa/io-app-design-system";
import { Alert } from "react-native";
import { IOScrollViewWithLargeHeader } from "../../../components/ui/IOScrollViewWithLargeHeader";

export const DSIOScrollViewScreenWithLargeHeader = () => {
  const theme = useIOTheme();

  return (
    <IOScrollViewWithLargeHeader
      actions={{
        type: "SingleButton",
        primary: {
          label: "Primary action",
          onPress: () => Alert.alert("Primary action pressed! (⁠⁠ꈍ⁠ᴗ⁠ꈍ⁠)")
        }
      }}
      title={{
        label: "Screen title"
      }}
      description={
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean lobortis luctus odio vel ultricies. Sed non urna dui. Morbi at ipsum pulvinar, sagittis massa ut, viverra nisi. Donec dignissim mi vitae convallis ornare. Pellentesque vel volutpat ex, non tempor neque. Nulla fringilla mi non nisl luctus viverra. Proin efficitur odio id volutpat sodales. Aliquam purus lacus, ultrices at maximus ut, molestie a lorem. Morbi arcu ligula, gravida eu egestas suscipit, congue ut ligula. Aliquam rutrum ante eget dolor feugiat molestie. Phasellus porta tempus nibh sed suscipit."
      }
    >
      <VSpacer size={16} />
      <ContentWrapper>
        <H3 color={theme["textHeading-default"]}>Start</H3>
        {[...Array(50)].map((_el, i) => (
          <Body key={`body-${i}`}>Repeated text - {i + 1}</Body>
        ))}
        <H3 color={theme["textHeading-default"]}>End</H3>
      </ContentWrapper>
    </IOScrollViewWithLargeHeader>
  );
};
