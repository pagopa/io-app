import {
  H3,
  IOColors,
  LabelSmall,
  useIOTheme,
  VSpacer
} from "@pagopa/io-app-design-system";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import Barcode from "react-native-barcode-builder";
import { withLightModalContext } from "../../components/helpers/withLightModalContext";
import { ContextualHelpPropsMarkdown } from "../../components/screens/BaseScreenComponent";
import { IOScrollViewWithLargeHeader } from "../../components/ui/IOScrollViewWithLargeHeader";
import I18n from "../../i18n";
import { useIOSelector } from "../../store/hooks";
import {
  profileFiscalCodeSelector,
  profileNameSurnameSelector
} from "../../store/reducers/profile";
import { setAccessibilityFocus } from "../../utils/accessibility";
import { useMaxBrightness } from "../../utils/brightness";
import { clipboardSetStringWithFeedback } from "../../utils/clipboard";
import { FAQsCategoriesType } from "../../utils/faq";

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

  const theme = useIOTheme();

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
      includeContentMargins
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
      <VSpacer size={8} />
      {fiscalCode && (
        <View
          accessible
          accessibilityLabel={I18n.t(
            "profile.fiscalCode.accessibility.fiscalCodeHint"
          )}
          style={[
            styles.card,
            { borderColor: IOColors[theme["cardBorder-default"]] }
          ]}
          testID="barcode-box"
        >
          <LabelSmall weight="Semibold">{nameSurname}</LabelSmall>
          <Barcode
            value={fiscalCode}
            width={1.3}
            height={80}
            background={"transparent"}
            lineColor={IOColors[theme["textHeading-default"]]}
          />
          <H3 testID="fiscal-code">{fiscalCode}</H3>
        </View>
      )}
    </IOScrollViewWithLargeHeader>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    borderCurve: "continuous",
    borderStyle: "solid",
    borderWidth: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16
  }
});

export default withLightModalContext(FiscalCodeScreen);
