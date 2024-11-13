import {
  FooterWithButtons,
  H2,
  H6,
  HSpacer,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { connect } from "react-redux";
import { InitializedProfile } from "../../../../../../../definitions/backend/InitializedProfile";
import { Abi } from "../../../../../../../definitions/pagopa/walletv2/Abi";
import { PaymentInstrument } from "../../../../../../../definitions/pagopa/walletv2/PaymentInstrument";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../../../i18n";
import { GlobalState } from "../../../../../../store/reducers/types";
import { isCoBadgeBlocked } from "../../../../../../utils/paymentMethod";
import PreviewCoBadgeCard from "../../../../cobadge/component/PreviewCoBadgeCard";
import { abiListSelector } from "../../../store/abi";

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
  const { headerTitle, screenTitle, label } = loadLocales(props);
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
            <H2 style={styles.title}>{screenTitle}</H2>
            <VSpacer size={8} />
            <H6 style={styles.flexStart}>{label}</H6>
            <VSpacer size={24} />
            <PreviewCoBadgeCard coBadge={props.pan} abi={abiInfo} />
            <VSpacer size={24} />
          </View>
          <VSpacer size={16} />
        </ScrollView>
      </SafeAreaView>
      {isCoBadgeBlocked(props.pan) ? (
        <FooterWithButtons
          type="SingleButton"
          primary={{
            type: "Solid",
            buttonProps: {
              label: I18n.t("global.buttons.continue"),
              onPress: props.handleSkip
            }
          }}
        />
      ) : (
        <FooterWithButtons
          type="TwoButtonsInlineThird"
          primary={{
            type: "Outline",
            buttonProps: {
              label: I18n.t("global.buttons.skip"),
              onPress: props.handleSkip
            }
          }}
          secondary={{
            type: "Solid",
            buttonProps: {
              label: I18n.t("global.buttons.add"),
              onPress: props.handleContinue
            }
          }}
        />
      )}
    </BaseScreenComponent>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  abiList: abiListSelector(state)
});

export default connect(mapStateToProps)(AddCobadgeComponent);
