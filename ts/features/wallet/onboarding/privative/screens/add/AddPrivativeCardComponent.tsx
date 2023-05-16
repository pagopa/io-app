import * as React from "react";
import { View, SafeAreaView, StyleSheet } from "react-native";
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
import { Body } from "../../../../../../components/core/typography/Body";
import FooterWithButtons from "../../../../../../components/ui/FooterWithButtons";
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../../../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import BasePrivativeCard from "../../../../privative/component/card/BasePrivativeCard";
import {
  HSpacer,
  VSpacer
} from "../../../../../../components/core/spacer/Spacer";

type Props = {
  paymentInstrument: PaymentInstrument;
  handleContinue: () => void;
  handleSkip: () => void;
} & Pick<React.ComponentProps<typeof BaseScreenComponent>, "contextualHelp">;

const styles = StyleSheet.create({
  container: {
    alignItems: "center"
  },
  title: { lineHeight: 33, alignSelf: "flex-start" }
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

  const caption = getTitleFromPaymentInstrument(props.paymentInstrument);

  const gdoLogo = props.paymentInstrument.abiCode
    ? getPrivativeGdoLogoUrl(props.paymentInstrument.abiCode)
    : undefined;
  const loyaltyLogo = props.paymentInstrument.abiCode
    ? getPrivativeLoyaltyLogoUrl(props.paymentInstrument.abiCode)
    : undefined;

  const isBlocked = isCoBadgeOrPrivativeBlocked(props.paymentInstrument);

  return (
    <BaseScreenComponent
      customGoBack={<HSpacer size={16} />}
      headerTitle={headerTitle}
      contextualHelp={props.contextualHelp}
    >
      <SafeAreaView style={IOStyles.flex} testID={"AddPrivativeComponent"}>
        <ScrollView style={IOStyles.flex}>
          <VSpacer size={16} />
          <View
            style={[
              styles.container,
              IOStyles.flex,
              IOStyles.horizontalContentPadding
            ]}
          >
            {!isBlocked ? <H1 style={styles.title}>{screenTitle}</H1> : null}
            <VSpacer size={24} />
            <BasePrivativeCard
              loyaltyLogo={loyaltyLogo}
              gdoLogo={gdoLogo}
              caption={caption}
              blocked={isCoBadgeOrPrivativeBlocked(props.paymentInstrument)}
              blurredNumber={props.paymentInstrument.panPartialNumber}
            />
            <VSpacer size={24} />
            {isBlocked && (
              <InfoBox iconColor="red" iconName="legError">
                <Body>{blockedCard}</Body>
              </InfoBox>
            )}
          </View>
          <VSpacer size={16} />
        </ScrollView>
        {isBlocked ? (
          <FooterWithButtons
            type={"SingleButton"}
            leftButton={cancelButtonProps(
              props.handleSkip,
              I18n.t("global.buttons.close")
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
