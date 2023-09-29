/**
 * A component to remind the user to validate his email
 */
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { Content } from "native-base";
import * as React from "react";
import { View, SafeAreaView } from "react-native";
import {
  IOPictogramSizeScale,
  Label,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";
import I18n from "../i18n";
import { profileEmailSelector } from "../store/reducers/profile";
import { useIOSelector } from "../store/hooks";
// import ROUTES from "../navigation/routes";
// import NavigationService from "../navigation/NavigationService";
import { IOStyles } from "./core/variables/IOStyles";
import FooterWithButtons from "./ui/FooterWithButtons";
import { LightModalContextInterface } from "./ui/LightModal";
import TopScreenComponent from "./screens/TopScreenComponent";
import { withLightModalContext } from "./helpers/withLightModalContext";

const EMPTY_EMAIL = "";
const VALIDATION_ILLUSTRATION_WIDTH: IOPictogramSizeScale = 80;

type OwnProp = {
  isOnboarding?: boolean;
};

type Props = LightModalContextInterface & OwnProp;

const NewSuccessEmailValidation = (props: Props) => {
  const { hideModal } = props;

  const optionEmail = useIOSelector(profileEmailSelector);

  const email = pipe(
    optionEmail,
    O.getOrElse(() => EMPTY_EMAIL)
  );

  const handleContinue = () => {
    hideModal();
    // NavigationService.navigate(ROUTES.PROFILE_NAVIGATOR, {
    //   screen: ROUTES.INSERT_EMAIL_SCREEN
    // });
  };

  const renderFooter = () => (
    <FooterWithButtons
      type={"SingleButton"}
      leftButton={{
        testID: "button-test",
        block: true,
        bordered: false,
        disabled: false,
        onPress: handleContinue,
        title: I18n.t("global.buttons.continue")
      }}
    />
  );

  return (
    <TopScreenComponent
      goBack={false}
      accessibilityEvents={{ avoidNavigationEventsUsage: true }}
    >
      <SafeAreaView style={IOStyles.flex}>
        <VSpacer size={40} />
        <VSpacer size={40} />
        <Content bounces={false} testID="container-test">
          <View style={IOStyles.selfCenter}>
            <Pictogram
              name={"emailValidation"}
              size={VALIDATION_ILLUSTRATION_WIDTH}
              color="aqua"
            />
          </View>
          <VSpacer size={16} />
          <View style={IOStyles.alignCenter}>
            <Label weight="Bold" testID="title-test">
              {I18n.t("email.newvalidemail.title")}
            </Label>
          </View>
          <VSpacer size={16} />
          <Label
            weight="Regular"
            style={{ textAlign: "center" }}
            testID="subtitle-test"
          >
            {I18n.t("email.newvalidemail.subtitle", { email })}
          </Label>
        </Content>
        {renderFooter()}
      </SafeAreaView>
    </TopScreenComponent>
  );
};
export default withLightModalContext(NewSuccessEmailValidation);
