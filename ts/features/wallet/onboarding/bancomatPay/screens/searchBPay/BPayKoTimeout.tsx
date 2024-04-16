import * as React from "react";
import { SafeAreaView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { FooterWithButtons } from "@pagopa/io-app-design-system";
import image from "../../../../../../../img/servicesStatus/error-detail-icon.png";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import { renderInfoRasterImage } from "../../../../../../components/infoScreen/imageRendering";
import { InfoScreenComponent } from "../../../../../../components/infoScreen/InfoScreenComponent";
import BaseScreenComponent from "../../../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../../../i18n";
import { GlobalState } from "../../../../../../store/reducers/types";
import { searchUserBPay, walletAddBPayCancel } from "../../store/actions";
import { onboardingBPayAbiSelectedSelector } from "../../store/reducers/abiSelected";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  Pick<React.ComponentProps<typeof BaseScreenComponent>, "contextualHelp">;

const loadLocales = () => ({
  headerTitle: I18n.t("wallet.onboarding.bPay.headerTitle"),
  title: I18n.t("wallet.onboarding.bPay.koTimeout.title"),
  body: I18n.t("wallet.onboarding.bPay.koTimeout.body"),
  cancel: I18n.t("global.buttons.cancel"),
  retry: I18n.t("global.buttons.retry")
});

/**
 * This screen informs the user that the search operation could not be completed
 * @constructor
 */
const BPayKoTimeout = (props: Props): React.ReactElement => {
  const { headerTitle, title, body, cancel, retry } = loadLocales();
  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle={headerTitle}
      contextualHelp={props.contextualHelp}
    >
      <SafeAreaView style={IOStyles.flex}>
        <InfoScreenComponent
          image={renderInfoRasterImage(image)}
          title={title}
          body={body}
        />
      </SafeAreaView>
      <FooterWithButtons
        type="TwoButtonsInlineThird"
        primary={{
          type: "Outline",
          buttonProps: {
            label: cancel,
            onPress: props.cancel
          }
        }}
        secondary={{
          type: "Solid",
          buttonProps: {
            label: retry,
            onPress: () => props.retry(props.abiSelected)
          }
        }}
      />
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  cancel: () => dispatch(walletAddBPayCancel()),
  retry: (abiSelected: string | undefined) =>
    dispatch(searchUserBPay.request(abiSelected))
});

const mapStateToProps = (state: GlobalState) => ({
  abiSelected: onboardingBPayAbiSelectedSelector(state)
});

export default connect(mapStateToProps, mapDispatchToProps)(BPayKoTimeout);
