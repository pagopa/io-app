import {
  Banner,
  Body,
  ButtonSolid,
  IOColors,
  IOSpacingScale,
  Label,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { StyleSheet, View } from "react-native";

import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NewH3 } from "../../../../../components/core/typography/NewH3";
import TopScreenComponent from "../../../../../components/screens/TopScreenComponent";
import I18n from "../../../../../i18n";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";

const CodeDigitDisplayBox = ({ digit }: { digit: string }) => (
  <View style={styles.codeDigit}>
    <NewH3>{digit}</NewH3>
  </View>
);
const CodeDisplayComponent = ({ code }: { code: string }) => (
  <View style={styles.codeDisplay}>
    {code.split("").map((digit, index) => (
      <CodeDigitDisplayBox key={index} digit={digit} />
    ))}
  </View>
);

export const IDPayCodeDisplayScreen = () => {
  const code = "12345"; // get from store
  const viewRef = React.useRef(null);
  const navigation = useNavigation(); // TODO:: delete
  return (
    <SafeAreaView style={styles.mainContainer}>
      <TopScreenComponent contextualHelp={emptyContextualHelp}>
        <NewH3>{I18n.t("idpay.code.onboarding.header")}</NewH3>
        <VSpacer size={16} />
        <Body color="grey-700" weight="Regular">
          {I18n.t("idpay.code.onboarding.body1")}
        </Body>
        <Body color="grey-700" weight="Bold">
          {I18n.t("idpay.code.onboarding.bodyBold")}
        </Body>
        <Label>{I18n.t("idpay.code.onboarding.bodyCta")}</Label>
        <VSpacer size={24} />
        <CodeDisplayComponent code={code} />
        <VSpacer size={24} />
        <Banner
          color="neutral"
          pictogramName="help" // security once new DS ver is released
          size="big"
          viewRef={viewRef}
          title={I18n.t("idpay.code.onboarding.banner.header")}
          content={I18n.t("idpay.code.onboarding.banner.body")}
        />
      </TopScreenComponent>
      <ButtonSolid
        accessibilityLabel={I18n.t("global.buttons.continue")}
        label={I18n.t("global.buttons.continue")}
        fullWidth={true}
        onPress={() => navigation.goBack()}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    paddingHorizontal: IOSpacingScale[6] // 24
  },
  codeDigit: {
    minHeight: 60,
    maxWidth: 60,
    flex: 1,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    borderColor: IOColors["grey-200"],
    borderRadius: 8,
    marginHorizontal: 2
  },
  codeDisplay: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between"
  }
});
