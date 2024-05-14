import { FooterWithButtons } from "@pagopa/io-app-design-system";
import * as React from "react";
import { SafeAreaView, View } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import image from "../../../../../../../../img/servicesStatus/error-detail-icon.png";
import { IOStyles } from "../../../../../../../components/core/variables/IOStyles";
import { InfoScreenComponent } from "../../../../../../../components/infoScreen/InfoScreenComponent";
import { renderInfoRasterImage } from "../../../../../../../components/infoScreen/imageRendering";
import BaseScreenComponent from "../../../../../../../components/screens/BaseScreenComponent";

import { useHardwareBackButton } from "../../../../../../../hooks/useHardwareBackButton";
import I18n from "../../../../../../../i18n";
import { navigateBack } from "../../../../../../../store/actions/navigation";
import { GlobalState } from "../../../../../../../store/reducers/types";
import { emptyContextualHelp } from "../../../../../../../utils/emptyContextualHelp";
import {
  searchUserCoBadge,
  walletAddCoBadgeCancel
} from "../../../store/actions";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  Pick<React.ComponentProps<typeof BaseScreenComponent>, "contextualHelp">;

const loadLocales = () => ({
  headerTitle: I18n.t("wallet.onboarding.coBadge.headerTitle"),
  title: I18n.t("wallet.onboarding.coBadge.search.koSingleBankNotFound.title"),
  body: I18n.t("wallet.onboarding.coBadge.search.koSingleBankNotFound.body"),
  continueStr: I18n.t("global.buttons.continue")
});

/**
 * This screen informs the user that no co-badge cards in his name were found.
 * A specific bank (ABI) has been selected
 * @constructor
 */
const CoBadgeKoSingleBankNotFound: React.FunctionComponent<Props> = props => {
  const { headerTitle, title, body, continueStr } = loadLocales();

  const onSearchAll = () => props.searchAll();

  useHardwareBackButton(() => {
    props.cancel();
    return true;
  });

  return (
    <BaseScreenComponent
      goBack={false}
      customGoBack={<View />}
      headerTitle={headerTitle}
      contextualHelp={emptyContextualHelp}
    >
      <SafeAreaView
        style={IOStyles.flex}
        testID={"CoBadgeKoSingleBankNotFound"}
      >
        <InfoScreenComponent
          image={renderInfoRasterImage(image)}
          title={title}
          body={body}
        />
      </SafeAreaView>
      <FooterWithButtons
        type={"TwoButtonsInlineThird"}
        primary={{
          type: "Outline",
          buttonProps: {
            label: I18n.t("global.buttons.cancel"),
            accessibilityLabel: I18n.t("global.buttons.cancel"),
            onPress: props.cancel
          }
        }}
        secondary={{
          type: "Solid",
          buttonProps: {
            label: continueStr,
            accessibilityLabel: continueStr,
            onPress: onSearchAll
          }
        }}
      />
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  cancel: () => dispatch(walletAddCoBadgeCancel()),
  back: () => navigateBack(),
  searchAll: () => dispatch(searchUserCoBadge.request(undefined))
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CoBadgeKoSingleBankNotFound);
