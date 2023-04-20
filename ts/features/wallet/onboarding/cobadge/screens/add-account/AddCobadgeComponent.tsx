import * as React from "react";
import { View, SafeAreaView, StyleSheet } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { connect } from "react-redux";
import { InitializedProfile } from "../../../../../../../definitions/backend/InitializedProfile";
import { PaymentInstrument } from "../../../../../../../definitions/pagopa/walletv2/PaymentInstrument";
import { InfoBox } from "../../../../../../components/box/InfoBox";
import { Body } from "../../../../../../components/core/typography/Body";
import { H1 } from "../../../../../../components/core/typography/H1";
import { H4 } from "../../../../../../components/core/typography/H4";
import { Label } from "../../../../../../components/core/typography/Label";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../../../components/ui/FooterWithButtons";
import I18n from "../../../../../../i18n";
import { GlobalState } from "../../../../../../store/reducers/types";
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../../../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { abiListSelector } from "../../../store/abi";
import { Abi } from "../../../../../../../definitions/pagopa/walletv2/Abi";
import PreviewCoBadgeCard from "../../../../cobadge/component/PreviewCoBadgeCard";
import { IOColors } from "../../../../../../components/core/variables/IOColors";
import { isCoBadgeOrPrivativeBlocked } from "../../../../../../utils/paymentMethod";
import {
  HSpacer,
  VSpacer
} from "../../../../../../components/core/spacer/Spacer";

type Props = {
  pan: PaymentInstrument;
  pansNumber: number;
  currentIndex: number;
  handleContinue: () => void;
  handleSkip: () => void;
  profile?: InitializedProfile;
} & ReturnType<typeof mapStateToProps> &
  Pick<React.ComponentProps<typeof BaseScreenComponent>, "contextualHelp">;

const styles = StyleSheet.create({
  container: {
    alignItems: "center"
  },
  title: { lineHeight: 33, alignSelf: "flex-start" },
  flexStart: { alignSelf: "flex-start" }
});

const loadLocales = (props: Props) => ({
  headerTitle: I18n.t("wallet.onboarding.coBadge.headerTitle"),
  screenTitle: I18n.t("wallet.onboarding.coBadge.add.screenTitle"),
  label: I18n.t("wallet.onboarding.coBadge.add.label", {
    current: props.currentIndex + 1,
    length: props.pansNumber
  }),
  blockedCard: I18n.t("wallet.onboarding.coBadge.add.blocked"),
  warning1: I18n.t("wallet.onboarding.coBadge.add.warning1"),
  warning2: I18n.t("wallet.onboarding.coBadge.add.warning2")
});

const AddCobadgeComponent: React.FunctionComponent<Props> = (props: Props) => {
  const [abiInfo, setAbiInfo] = React.useState<Abi>({});
  const { pan, abiList } = props;
  const { headerTitle, screenTitle, label, blockedCard, warning1, warning2 } =
    loadLocales(props);
  React.useEffect(() => {
    const abi: Abi | undefined = abiList.find(elem => elem.abi === pan.abiCode);
    setAbiInfo(abi ?? {});
  }, [pan, abiList]);

  return (
    <BaseScreenComponent
      customGoBack={<HSpacer size={16} />}
      headerTitle={headerTitle}
      contextualHelp={props.contextualHelp}
    >
      <SafeAreaView style={IOStyles.flex} testID={"AddCobadgeComponent"}>
        <ScrollView style={IOStyles.flex}>
          <VSpacer size={16} />
          <View
            style={[
              styles.container,
              IOStyles.flex,
              IOStyles.horizontalContentPadding
            ]}
          >
            <H1 style={styles.title}>{screenTitle}</H1>
            <VSpacer size={8} />
            <H4 weight={"Regular"} style={styles.flexStart}>
              {label}
            </H4>
            <VSpacer size={24} />
            <PreviewCoBadgeCard coBadge={props.pan} abi={abiInfo} />
            <VSpacer size={24} />
            {isCoBadgeOrPrivativeBlocked(props.pan) ? (
              <InfoBox iconColor={IOColors.red} iconName={"io-error"}>
                <Body>{blockedCard}</Body>
              </InfoBox>
            ) : (
              <InfoBox>
                <Body>
                  {warning1} <Label color={"bluegrey"}>{warning2}</Label>
                </Body>
              </InfoBox>
            )}
          </View>
          <VSpacer size={16} />
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

const mapStateToProps = (state: GlobalState) => ({
  abiList: abiListSelector(state)
});

export default connect(mapStateToProps)(AddCobadgeComponent);
