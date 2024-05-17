import * as React from "react";
import { View, StyleSheet } from "react-native";
import {
  IOColors,
  VSpacer,
  ContentWrapper,
  H3,
  Label
} from "@pagopa/io-app-design-system";
import Barcode from "react-native-barcode-builder";
import { withLightModalContext } from "../../components/helpers/withLightModalContext";
import { ContextualHelpPropsMarkdown } from "../../components/screens/BaseScreenComponent";
import I18n from "../../i18n";
import {
  profileFiscalCodeSelector,
  profileNameSurnameSelector
} from "../../store/reducers/profile";
import { RNavScreenWithLargeHeader } from "../../components/ui/RNavScreenWithLargeHeader";
import { FAQsCategoriesType } from "../../utils/faq";
import { useIOSelector } from "../../store/hooks";
import { useMaxBrightness } from "../../utils/brightness";

const FAQ_CATEGORIES: ReadonlyArray<FAQsCategoriesType> = ["profile"];

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "profile.fiscalCode.title",
  body: "profile.fiscalCode.help"
};

/**
 * This screen displays the barcode of the user's tax code.
 */
const FiscalCodeScreen = () => {
  useMaxBrightness();

  const nameSurname = useIOSelector(profileNameSurnameSelector);
  const fiscalCode = useIOSelector(profileFiscalCodeSelector);

  return (
    <RNavScreenWithLargeHeader
      title={{
        label: I18n.t("profile.fiscalCode.fiscalCode")
      }}
      description={I18n.t("profile.fiscalCode.description")}
      headerActionsProp={{ showHelp: true }}
      contextualHelpMarkdown={contextualHelpMarkdown}
      faqCategories={FAQ_CATEGORIES}
    >
      <VSpacer size={24} />
      <ContentWrapper>
        <View style={styles.box}>
          <Label weight="Regular">{nameSurname}</Label>
          <Barcode
            value={fiscalCode || ""}
            width={1.3}
            height={80}
            lineColor="#000"
          />
          <H3>{fiscalCode}</H3>
        </View>
      </ContentWrapper>
    </RNavScreenWithLargeHeader>
  );
};

const styles = StyleSheet.create({
  box: {
    borderRadius: 8,
    borderColor: IOColors.bluegreyLight,
    borderStyle: "solid",
    borderWidth: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16
  }
});

export default withLightModalContext(FiscalCodeScreen);
