import React from "react";
import {
  ButtonSolid,
  ContentWrapper,
  H3,
  IOStyles,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";
import { View } from "react-native";
import I18n from "../i18n";

type TosWebviewErrorComponentProps = {
  handleRetry: () => void;
};

const TosWebviewErrorComponent = ({
  handleRetry
}: TosWebviewErrorComponentProps) => (
  <>
    <View
      style={[
        IOStyles.flex,
        IOStyles.alignCenter,
        IOStyles.horizontalContentPadding,
        IOStyles.centerJustified
      ]}
      testID="toSErrorContainerView"
    >
      <Pictogram name="stopSecurity" />
      <VSpacer size={8} />
      <H3 testID="toSErrorContainerTitle" style={{ textAlign: "center" }}>
        {I18n.t("onboarding.tos.error")}
      </H3>
    </View>
    <ContentWrapper>
      <ButtonSolid
        fullWidth
        onPress={handleRetry}
        label={I18n.t("global.buttons.retry")}
        testID="RetryButtonTest"
      />
    </ContentWrapper>
  </>
);
export default TosWebviewErrorComponent;
