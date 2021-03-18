import * as React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { View } from "native-base";
import { ScrollView } from "react-native-gesture-handler";
import I18n from "../../../../../../i18n";
import { PaymentInstrument } from "../../../../../../../definitions/pagopa/walletv2/PaymentInstrument";
import BaseScreenComponent from "../../../../../../components/screens/BaseScreenComponent";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import { H1 } from "../../../../../../components/core/typography/H1";
import {
  getPrivativeGdoLogoUrl,
  getPrivativeLoyaltyLogoUrl,
  getTitleFromPaymentInstrument,
  isCoBadgeOrPrivativeBlocked
} from "../../../../../../utils/paymentMethod";
import { InfoBox } from "../../../../../../components/box/InfoBox";
import { IOColors } from "../../../../../../components/core/variables/IOColors";
import { Body } from "../../../../../../components/core/typography/Body";
import FooterWithButtons from "../../../../../../components/ui/FooterWithButtons";
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../../../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import BasePrivativeCard from "../../../../privative/component/card/BasePrivativeCard";

type Props = {
  pan: PaymentInstrument;
  handleContinue: () => void;
  handleSkip: () => void;
} & Pick<React.ComponentProps<typeof BaseScreenComponent>, "contextualHelp">;

const styles = StyleSheet.create({
  container: {
    alignItems: "center"
  },
  title: { lineHeight: 33, alignSelf: "flex-start" },
  flexStart: { alignSelf: "flex-start" }
});

const loadLocales = () => ({
  headerTitle: I18n.t("wallet.onboarding.privative.headerTitle"),
  screenTitle: I18n.t("wallet.onboarding.privative.add.screenTitle"),
  blockedCard: I18n.t("wallet.onboarding.privative.add.blocked")
});

const AddPrivativeCardComponent: React.FunctionComponent<Props> = (
  props: Props
) => {
  const { headerTitle, screenTitle, blockedCard } = loadLocales();

  const caption = getTitleFromPaymentInstrument(props.pan);

  const gdoLogo = props.pan.abiCode
    ? getPrivativeGdoLogoUrl(props.pan.abiCode)
    : undefined;
  const loyaltyLogo = props.pan.abiCode
    ? getPrivativeLoyaltyLogoUrl(props.pan.abiCode)
    : undefined;

  return (
    <BaseScreenComponent
      customGoBack={<View hspacer={true} spacer={true} />}
      headerTitle={headerTitle}
      contextualHelp={props.contextualHelp}
    >
      <SafeAreaView style={IOStyles.flex} testID={"AddPrivativeComponent"}>
        <ScrollView style={IOStyles.flex}>
          <View spacer={true} />
          <View
            style={[
              styles.container,
              IOStyles.flex,
              IOStyles.horizontalContentPadding
            ]}
          >
            <H1 style={styles.title}>{screenTitle}</H1>
            <View spacer={true} large={true} />
            <BasePrivativeCard
              loyaltyLogo={loyaltyLogo}
              gdoLogo={gdoLogo}
              caption={caption}
              blocked={isCoBadgeOrPrivativeBlocked(props.pan)}
            />
            <View spacer={true} large={true} />
            {isCoBadgeOrPrivativeBlocked(props.pan) && (
              <InfoBox iconColor={IOColors.red} iconName={"io-error"}>
                <Body>{blockedCard}</Body>
              </InfoBox>
            )}
          </View>
          <View spacer />
        </ScrollView>
        {isCoBadgeOrPrivativeBlocked(props.pan) ? (
          <FooterWithButtons
            type={"SingleButton"}
            leftButton={confirmButtonProps(
              props.handleSkip,
              I18n.t("global.buttons.continue")
            )}
          />
        ) : (
          <FooterWithButtons
            type={"TwoButtonsInlineThird"}
            leftButton={cancelButtonProps(
              props.handleSkip,
              I18n.t("global.buttons.skip")
            )}
            rightButton={confirmButtonProps(
              props.handleContinue,
              I18n.t("global.buttons.add")
            )}
          />
        )}
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default AddPrivativeCardComponent;
