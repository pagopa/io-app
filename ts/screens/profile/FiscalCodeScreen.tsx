import React, { useState, useCallback, useRef } from "react";
import { View, StyleSheet } from "react-native";
import {
  IOColors,
  VSpacer,
  ContentWrapper,
  H3,
  LabelSmall
} from "@pagopa/io-app-design-system";
import Barcode from "react-native-barcode-builder";
import { useFocusEffect } from "@react-navigation/native";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { withLightModalContext } from "../../components/helpers/withLightModalContext";
import { ContextualHelpPropsMarkdown } from "../../components/screens/BaseScreenComponent";
import I18n from "../../i18n";
import {
  profileFiscalCodeSelector,
  profileNameSurnameSelector
} from "../../store/reducers/profile";
import { IOScrollViewWithLargeHeader } from "../../components/ui/IOScrollViewWithLargeHeader";
import { FAQsCategoriesType } from "../../utils/faq";
import { useIOSelector } from "../../store/hooks";
import { useMaxBrightness } from "../../utils/brightness";
import { setAccessibilityFocus } from "../../utils/accessibility";
import { clipboardSetStringWithFeedback } from "../../utils/clipboard";

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

  const titleRef = useRef<View>(null);
  const [isCFCopied, setIsCFCopied] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setAccessibilityFocus(titleRef, 300 as Millisecond);
    }, [])
  );

  const nameSurname = useIOSelector(profileNameSurnameSelector);
  const fiscalCode = useIOSelector(profileFiscalCodeSelector);

  const onPressCopyButton = useCallback(() => {
    if (!isCFCopied) {
      setIsCFCopied(true);
      clipboardSetStringWithFeedback(fiscalCode ?? "");
      setTimeout(() => {
        setIsCFCopied(false);
      }, 5000);
    }
  }, [fiscalCode, isCFCopied]);

  return (
    <IOScrollViewWithLargeHeader
      ref={titleRef}
      title={{
        label: I18n.t("profile.fiscalCode.fiscalCode")
      }}
      actions={{
        type: "SingleButton",
        primary: {
          label: isCFCopied
            ? I18n.t("profile.fiscalCode.codeCopied")
            : I18n.t("profile.fiscalCode.copyCode"),
          onPress: onPressCopyButton,
          accessibilityLabel: isCFCopied
            ? I18n.t("profile.fiscalCode.codeCopied")
            : I18n.t("profile.fiscalCode.copyCode")
        }
      }}
      description={I18n.t("profile.fiscalCode.description")}
      headerActionsProp={{ showHelp: true }}
      contextualHelpMarkdown={contextualHelpMarkdown}
      faqCategories={FAQ_CATEGORIES}
    >
      <VSpacer size={24} />
      {fiscalCode && (
        <ContentWrapper>
          <View
            accessible
            accessibilityLabel={I18n.t(
              "profile.fiscalCode.accessibility.fiscalCodeHint"
            )}
            style={styles.box}
            testID="barcode-box"
          >
            <LabelSmall weight="Semibold" color="black">
              {nameSurname}
            </LabelSmall>
            <Barcode
              value={fiscalCode}
              width={1.3}
              height={80}
              lineColor={IOColors.black}
            />
            <H3 testID="fiscal-code">{fiscalCode}</H3>
          </View>
        </ContentWrapper>
      )}
    </IOScrollViewWithLargeHeader>
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
