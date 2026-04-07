import {
  Body,
  H3,
  useIOTheme,
  VSpacer,
  WithTestID
} from "@pagopa/io-app-design-system";
import { SafeAreaView } from "react-native-safe-area-context";
import { LoadingIndicator } from "../../../components/ui/LoadingIndicator";

type Props = WithTestID<
  Readonly<{
    captionTitle?: string;
    captionSubtitle?: string;
  }>
>;

/**
 * A Component to display an animated spinner.
 * It can be used to display a loading spinner with optionally a caption title and subtitle.
 * @deprecated Use `LoadingScreenContent` component instead
 */
const LoadingComponent = (props: Props) => {
  const theme = useIOTheme();
  const { captionTitle, captionSubtitle } = props;

  return (
    <SafeAreaView
      style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      testID={props.testID}
    >
      <LoadingIndicator />
      <VSpacer size={48} />
      <H3
        color={theme["textHeading-secondary"]}
        style={{ textAlign: "center" }}
        testID="LoadingSpinnerCaptionTitleID"
      >
        {captionTitle}
      </H3>
      <VSpacer />
      <Body
        style={{ textAlign: "center" }}
        testID="LoadingSpinnerCaptionSubTitleID"
      >
        {captionSubtitle}
      </Body>
    </SafeAreaView>
  );
};

export default LoadingComponent;
