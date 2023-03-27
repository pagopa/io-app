/**
 * A component to show the fiscal code fac-simile in Landscape
 */
import * as pot from "@pagopa/ts-commons/lib/pot";
import { Body, Button, Container, Right } from "native-base";
import * as React from "react";
import {
  View,
  BackHandler,
  ScrollView,
  StatusBar,
  StyleSheet
} from "react-native";
import { InitializedProfile } from "../../definitions/backend/InitializedProfile";
import { Municipality } from "../../definitions/content/Municipality";
import IconFont from "../components/ui/IconFont";
import I18n from "../i18n";
import customVariables from "../theme/variables";
import { useMaxBrightness } from "../utils/brightness";
import FiscalCodeComponent from "./FiscalCodeComponent";
import AppHeader from "./ui/AppHeader";
import { IOColors } from "./core/variables/IOColors";
import { VSpacer } from "./core/spacer/Spacer";

export type Props = Readonly<{
  onCancel: () => void;
  profile: InitializedProfile;
  municipality: pot.Pot<Municipality, Error>;
  showBackSide?: boolean;
}>;

const styles = StyleSheet.create({
  content: {
    backgroundColor: IOColors.bluegrey,
    paddingHorizontal: customVariables.contentPadding,
    paddingTop: 0
  }
});

const FiscalCodeLandscapeOverlay: React.FunctionComponent<Props> = (
  props: Props
) => {
  // eslint-disable-next-line functional/no-let
  let scrollTimeout: number | undefined;

  const ScrollViewRef = React.createRef<ScrollView>();

  const handleBackPress = () => {
    // On backpress the component gets unmounted, so the brightness is restored by the
    // cleanup function
    props.onCancel();
    return true;
  };

  const scrollToEnd = () => {
    if (props.showBackSide && ScrollViewRef.current) {
      // delay the scroll to end command to wait until the ingress animation is completed
      // eslint-disable-next-line
      scrollTimeout = setTimeout(() => {
        if (ScrollViewRef.current) {
          ScrollViewRef.current.scrollToEnd({ animated: true });
        }
      }, 300);
    }
  };

  React.useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress
    );
    return () => {
      subscription.remove();
      // if there is an active timeout, clear it!
      if (scrollTimeout !== undefined) {
        clearTimeout(scrollTimeout);
        // eslint-disable-next-line
        scrollTimeout = undefined;
      }
    };
  }, []);

  useMaxBrightness();

  return (
    <Container style={{ backgroundColor: IOColors.bluegrey }}>
      <AppHeader noLeft={true} dark={true}>
        <Body />
        <Right>
          <Button
            transparent={true}
            onPress={props.onCancel}
            accessible={true}
            accessibilityRole={"button"}
            accessibilityLabel={I18n.t("global.buttons.close")}
          >
            <IconFont name="io-close" color={IOColors.white} />
          </Button>
        </Right>
      </AppHeader>
      <StatusBar
        backgroundColor={IOColors.bluegrey}
        barStyle={"light-content"}
      />
      <ScrollView
        onLayout={scrollToEnd}
        ref={ScrollViewRef}
        style={styles.content}
      >
        <VSpacer size={16} />
        <View>
          <FiscalCodeComponent
            type={"Landscape"}
            profile={props.profile}
            getBackSide={false}
            municipality={props.municipality}
          />
        </View>

        <VSpacer size={16} />

        <FiscalCodeComponent
          type={"Landscape"}
          profile={props.profile}
          getBackSide={true}
          municipality={props.municipality}
        />

        <VSpacer size={48} />
      </ScrollView>
    </Container>
  );
};

export default FiscalCodeLandscapeOverlay;
