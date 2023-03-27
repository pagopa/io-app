import * as React from "react";
import { View, FlatList, ListRenderItemInfo, SafeAreaView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { PrivativeServiceStatusEnum } from "../../../../../../../definitions/pagopa/privative/configuration/PrivativeServiceStatus";
import { VSpacer } from "../../../../../../components/core/spacer/Spacer";
import { Body } from "../../../../../../components/core/typography/Body";
import { H1 } from "../../../../../../components/core/typography/H1";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../../../components/ui/FooterWithButtons";
import I18n from "../../../../../../i18n";
import { GlobalState } from "../../../../../../store/reducers/types";
import { emptyContextualHelp } from "../../../../../../utils/emptyContextualHelp";
import { cancelButtonProps } from "../../../../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { BankPreviewItem } from "../../../bancomat/components/BankPreviewItem";
import {
  navigateToOnboardingPrivativeInsertCardNumberScreen,
  navigateToOnboardingPrivativeKoDisabledScreen,
  navigateToOnboardingPrivativeKoUnavailableScreen
} from "../../navigation/action";
import {
  walletAddPrivativeCancel,
  walletAddPrivativeChooseIssuer
} from "../../store/actions";
import { PrivativeIssuer } from "../../store/reducers/privativeIssuers";
import { PrivativeIssuerId } from "../../store/reducers/searchedPrivative";

type OwnProps = {
  privativeIssuers: ReadonlyArray<PrivativeIssuer>;
};

type Props = OwnProps &
  ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const loadLocales = () => ({
  headerTitle: I18n.t("wallet.onboarding.privative.headerTitle"),
  title: I18n.t("wallet.onboarding.privative.choosePrivativeIssuer.title"),
  body: I18n.t("wallet.onboarding.privative.choosePrivativeIssuer.body")
});

const handlePress = (pi: PrivativeIssuer, props: Props) => {
  switch (pi.status) {
    case PrivativeServiceStatusEnum.enabled:
      props.chooseIssuer(pi.id);
      break;
    case PrivativeServiceStatusEnum.disabled:
      props.navigateToDisabled();
      break;
    case PrivativeServiceStatusEnum.unavailable:
      props.navigateToUnavailable();
      break;
  }
};

const renderItem = (pi: ListRenderItemInfo<PrivativeIssuer>, props: Props) => (
  <BankPreviewItem
    bank={{
      abi: pi.item.id,
      name: `${pi.item.gdo} - ${pi.item.loyalty}`,
      logoUrl: pi.item.gdoLogo
    }}
    inList={true}
    onPress={_ => handlePress(pi.item, props)}
  />
);

const ChoosePrivativeIssuerComponent = (props: Props): React.ReactElement => {
  const { headerTitle, title, body } = loadLocales();
  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle={headerTitle}
      contextualHelp={emptyContextualHelp}
    >
      <SafeAreaView
        style={IOStyles.flex}
        testID={"ChoosePrivativeIssuerComponent"}
      >
        <View style={[IOStyles.horizontalContentPadding, IOStyles.flex]}>
          <H1>{title}</H1>
          <VSpacer size={16} />
          <Body>{body}</Body>
          <FlatList
            data={props.privativeIssuers}
            renderItem={v => renderItem(v, props)}
            keyExtractor={privativeIssuer => privativeIssuer.id}
            keyboardShouldPersistTaps={"handled"}
          />
        </View>
        <FooterWithButtons
          type={"SingleButton"}
          leftButton={cancelButtonProps(props.cancel)}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  cancel: () => dispatch(walletAddPrivativeCancel()),
  chooseIssuer: (issuerId: PrivativeIssuerId) => {
    dispatch(walletAddPrivativeChooseIssuer(issuerId));
    navigateToOnboardingPrivativeInsertCardNumberScreen();
  },
  navigateToDisabled: () => navigateToOnboardingPrivativeKoDisabledScreen(),
  navigateToUnavailable: () =>
    navigateToOnboardingPrivativeKoUnavailableScreen()
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ChoosePrivativeIssuerComponent);
