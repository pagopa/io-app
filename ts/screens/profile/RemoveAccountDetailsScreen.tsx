import * as pot from "italia-ts-commons/lib/pot";
import { Text, List } from "native-base";
import * as React from "react";

import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { UserDataProcessingChoiceEnum } from "../../../definitions/backend/UserDataProcessingChoice";
import { withLoadingSpinner } from "../../components/helpers/withLoadingSpinner";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import ScreenContent from "../../components/screens/ScreenContent";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import { RadioButtonList } from "../../components/core/selection/RadioButtonList";
import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";
import { ReduxProps } from "../../store/actions/types";
import {
  resetUserDataProcessingRequest,
  upsertUserDataProcessing
} from "../../store/actions/userDataProcessing";
import { GlobalState } from "../../store/reducers/types";
import { userDataProcessingSelector } from "../../store/reducers/userDataProcessing";
import themeVariables from "../../theme/variables";
import { showToast } from "../../utils/showToast";
import reactotron from "reactotron-react-native";
import { RootModal } from "../modal/RootModal";
import IdentificationModal from "../modal/IdentificationModal";
import SystemOffModal from "../modal/SystemOffModal";

type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>;
};

type Props = ReduxProps &
  OwnProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

/**
 * A screen to explain how the account removal works.
 * Here user can ask to delete his account
 */
export const RemoveAccountDetails: React.FunctionComponent<Props> = (
  props: Props
) => {
  const [isMarkdownLoaded, setisMarkdownLoaded] = React.useState(false);
  // Initially no motivation is selected
  const [selectedMotivation, setSelectedMotivation] = React.useState(-1);

  const handleContinuePress = (): void => {
    props.navigation.navigate(ROUTES.PROFILE_DOWNLOAD_DATA);
  };

  return (
    <IdentificationModal identificationProgressState="pippo" />
    // <TopScreenComponent
    //   goBack={true}
    //   headerTitle={I18n.t("profile.main.title")}
    // >
    //   <ScreenContent
    //     title={I18n.t("profile.main.privacy.removeAccountInfo.title")}
    //     bounces={false}
    //   >
    //     <Text
    //       style={{
    //         paddingHorizontal: themeVariables.contentPadding
    //       }}
    //     >
    //       {I18n.t("send_email_messages.subtitle")}
    //       <Text bold={true}>Pippo</Text>
    //       <Text>{I18n.t("global.symbols.question")}</Text>
    //     </Text>

    //     <List withContentLateralPadding={true} style={{ paddingTop: 6 }}>
    //       <RadioButtonList
    //         head="Qual'è il motivo della cancellazione?"
    //         key="delete_reason"
    //         items={[
    //           { label: "Non ritengo più utile IO", id: 0 },
    //           { label: "Non mi sento al sicuro su IO", id: 1 },
    //           { label: "Non ho mai usato l'app", id: 2 },
    //           { label: "Nessuno dei precedenti", id: 3 }
    //         ]}
    //         selectedItem={selectedMotivation}
    //         onPress={motivationIndex => {
    //           setSelectedMotivation(motivationIndex);
    //         }}
    //       />
    //     </List>
    //   </ScreenContent>
    //   {isMarkdownLoaded && (
    //     <FooterWithButtons
    //       type={"SingleButton"}
    //       leftButton={{
    //         block: true,
    //         primary: true,
    //         onPress: handleContinuePress,
    //         title: I18n.t("profile.main.privacy.removeAccountInfo.cta")
    //       }}
    //     />
    //   )}
    // </TopScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  upsertUserDataProcessing: () =>
    dispatch(
      upsertUserDataProcessing.request(UserDataProcessingChoiceEnum.DOWNLOAD)
    ),
  resetRequest: () =>
    dispatch(
      resetUserDataProcessingRequest(UserDataProcessingChoiceEnum.DOWNLOAD)
    )
});

function mapStateToProps(state: GlobalState) {
  const userDataProcessing = userDataProcessingSelector(state);
  const isLoading =
    pot.isLoading(userDataProcessing.DOWNLOAD) ||
    pot.isUpdating(userDataProcessing.DOWNLOAD);
  return {
    userDataProcessing,
    isLoading
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RemoveAccountDetails);
