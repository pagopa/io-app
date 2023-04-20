import * as React from "react";
import { View, SafeAreaView, ScrollView, StyleSheet } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Satispay } from "../../../../../../../definitions/pagopa/walletv2/Satispay";
import { VSpacer } from "../../../../../../components/core/spacer/Spacer";
import { H1 } from "../../../../../../components/core/typography/H1";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../../../components/ui/FooterWithButtons";
import I18n from "../../../../../../i18n";
import { GlobalState } from "../../../../../../store/reducers/types";
import { emptyContextualHelp } from "../../../../../../utils/emptyContextualHelp";
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../../../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import {
  isError,
  isLoading,
  isUndefined
} from "../../../../../bonus/bpd/model/RemoteValue";
import SatispayCard from "../../../../satispay/SatispayCard";
import {
  addSatispayToWallet,
  walletAddSatispayCancel,
  walletAddSatispayCompleted
} from "../../store/actions";
import { onboardingSatispayAddingResultSelector } from "../../store/reducers/addingSatispay";
import { onboardingSatispayFoundSelector } from "../../store/reducers/foundSatispay";
import LoadAddSatispayComponent from "./LoadAddSatispayComponent";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const styles = StyleSheet.create({
  center: {
    alignSelf: "center"
  }
});

const loadLocales = () => ({
  headerTitle: I18n.t("wallet.onboarding.satispay.headerTitle"),
  title: I18n.t("wallet.onboarding.satispay.add.title")
});

const DisplayFoundSatispay = (props: Props) => {
  const { headerTitle, title } = loadLocales();
  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle={headerTitle}
      contextualHelp={emptyContextualHelp}
    >
      <SafeAreaView style={IOStyles.flex}>
        <ScrollView>
          <View style={IOStyles.horizontalContentPadding}>
            <VSpacer size={16} />
            <H1>{title}</H1>
            <VSpacer size={40} />
            <View style={styles.center}>
              <SatispayCard />
            </View>
          </View>
        </ScrollView>
        <FooterWithButtons
          type={"TwoButtonsInlineThird"}
          leftButton={cancelButtonProps(props.cancel)}
          rightButton={confirmButtonProps(
            () => props.satispay && props.confirm(props.satispay),
            I18n.t("global.buttons.continue")
          )}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

/**
 * The user can choose to add the found Satispay account to the wallet
 * @constructor
 */
const AddSatispayScreen = (props: Props) => {
  if (isUndefined(props.addingSatispay)) {
    return <DisplayFoundSatispay {...props} />;
  }
  if (isError(props.addingSatispay) || isLoading(props.addingSatispay)) {
    return <LoadAddSatispayComponent />;
  }
  props.completed();
  return null;
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  cancel: () => dispatch(walletAddSatispayCancel()),
  confirm: (satispay: Satispay) =>
    dispatch(addSatispayToWallet.request(satispay)),
  completed: () => dispatch(walletAddSatispayCompleted())
});

const mapStateToProps = (state: GlobalState) => ({
  satispay: onboardingSatispayFoundSelector(state),
  addingSatispay: onboardingSatispayAddingResultSelector(state)
});

export default connect(mapStateToProps, mapDispatchToProps)(AddSatispayScreen);
