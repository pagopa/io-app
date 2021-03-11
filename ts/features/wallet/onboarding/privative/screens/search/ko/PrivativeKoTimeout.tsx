import { View } from "native-base";
import * as React from "react";
import { SafeAreaView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { H1 } from "../../../../../../../components/core/typography/H1";
import { IOStyles } from "../../../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../../../../components/ui/FooterWithButtons";
import I18n from "../../../../../../../i18n";
import { GlobalState } from "../../../../../../../store/reducers/types";
import { emptyContextualHelp } from "../../../../../../../utils/emptyContextualHelp";
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../../../../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import {
  PrivativeQuery,
  searchUserPrivative,
  walletAddPrivativeCancel
} from "../../../store/actions";
import { onboardingSearchedPrivativeQuery } from "../../../store/reducers/searchedPrivative";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * This screen informs the user that a timeout is occurred while searching the indicated privative card.
 * The timeout can be:
 * - A networking timeout
 * - An application center which send a pending response
 * @param props
 * @constructor
 */
const PrivativeKoTimeout = (props: Props): React.ReactElement => (
  <BaseScreenComponent
    goBack={true}
    headerTitle={I18n.t("wallet.onboarding.privative.headerTitle")}
    contextualHelp={emptyContextualHelp}
  >
    <SafeAreaView style={IOStyles.flex}>
      {/* TODO: Complete the component, this is a draft version for test purpose only */}
      <View style={[IOStyles.horizontalContentPadding, IOStyles.flex]}>
        <H1>TMP Timeout Screen</H1>
      </View>
      <FooterWithButtons
        type={"TwoButtonsInlineThird"}
        leftButton={cancelButtonProps(props.cancel)}
        rightButton={confirmButtonProps(
          () =>
            props.searchedPrivative
              ? props.search(props.searchedPrivative)
              : undefined,
          I18n.t("global.buttons.retry")
        )}
      />
    </SafeAreaView>
  </BaseScreenComponent>
);

const mapDispatchToProps = (dispatch: Dispatch) => ({
  cancel: () => dispatch(walletAddPrivativeCancel()),
  search: (pq: PrivativeQuery) => dispatch(searchUserPrivative.request(pq))
});

const mapStateToProps = (state: GlobalState) => ({
  searchedPrivative: onboardingSearchedPrivativeQuery(state)
});

export default connect(mapStateToProps, mapDispatchToProps)(PrivativeKoTimeout);
