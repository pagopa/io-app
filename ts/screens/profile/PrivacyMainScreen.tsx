import * as pot from "@pagopa/ts-commons/lib/pot";
import { List } from "native-base";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, AlertButton } from "react-native";
import { UserDataProcessingChoiceEnum } from "../../../definitions/backend/UserDataProcessingChoice";
import { UserDataProcessingStatusEnum } from "../../../definitions/backend/UserDataProcessingStatus";
import LoadingSpinnerOverlay from "../../components/LoadingSpinnerOverlay";
import { ContextualHelpPropsMarkdown } from "../../components/screens/BaseScreenComponent";
import ListItemComponent from "../../components/screens/ListItemComponent";
import ScreenContent from "../../components/screens/ScreenContent";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import I18n from "../../i18n";
import { IOStackNavigationProp } from "../../navigation/params/AppParamsList";
import { ProfileParamsList } from "../../navigation/params/ProfileParamsList";
import ROUTES from "../../navigation/routes";
import {
  deleteUserDataProcessing,
  loadUserDataProcessing
} from "../../store/actions/userDataProcessing";
import { useIODispatch, useIOSelector } from "../../store/hooks";
import { userDataProcessingSelector } from "../../store/reducers/userDataProcessing";
import { useOnFirstRender } from "../../utils/hooks/useOnFirstRender";
import { usePrevious } from "../../utils/hooks/usePrevious";
import { showToast } from "../../utils/showToast";

type Props = {
  navigation: IOStackNavigationProp<ProfileParamsList, "PROFILE_PRIVACY_MAIN">;
};

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "profile.main.privacy.privacyPolicy.contextualHelpTitle",
  body: "profile.main.privacy.privacyPolicy.contextualHelpContent"
};

const getRequestProcessingAlertTitle = () => ({
  DOWNLOAD: I18n.t("profile.main.privacy.exportData.alert.oldRequest"),
  DELETE: I18n.t("profile.main.privacy.removeAccount.alert.oldRequest")
});

const getRequestProcessingAlertSubtitle = () => ({
  DOWNLOAD: I18n.t("profile.main.privacy.exportData.alert.confirmSubtitle"),
  DELETE: I18n.t("profile.main.privacy.removeAccount.alert.oldRequestSubtitle")
});

/**
 * A screen to show the main screen of the Privacy section.
 * Here the user can:
 * - display the accepted privacy policy (or Term of Service)
 * - send a request to delete his profile
 * - send a request to export all his data
 */
const PrivacyMainScreen = ({ navigation }: Props) => {
  const dispatch = useIODispatch();
  const userDataProcessing = useIOSelector(userDataProcessingSelector);
  const prevUserDataProcessing = usePrevious(userDataProcessing);
  const [requestProcess, setRequestProcess] = useState(false);
  const isLoading =
    pot.isLoading(userDataProcessing.DELETE) ||
    pot.isLoading(userDataProcessing.DOWNLOAD);

  useOnFirstRender(() => {
    // get fresh info about DOWNLOAD/DELETE state
    // if any of these is WIP a relative badge will be displayed
    dispatch(
      loadUserDataProcessing.request(UserDataProcessingChoiceEnum.DELETE)
    );
    dispatch(
      loadUserDataProcessing.request(UserDataProcessingChoiceEnum.DOWNLOAD)
    );
  });

  // show an alert to confirm the request submission
  const handleAlreadyProcessingAlert = useCallback(
    (choice: UserDataProcessingChoiceEnum) => {
      const alertButton: Array<AlertButton> =
        choice === UserDataProcessingChoiceEnum.DOWNLOAD
          ? [
              {
                text: I18n.t("global.buttons.ok"),
                style: "default"
              }
            ]
          : [
              {
                text: I18n.t(
                  "profile.main.privacy.removeAccount.alert.cta.return"
                ),
                style: "default"
              },
              {
                text: I18n.t(
                  "profile.main.privacy.removeAccount.alert.cta.cancel"
                ),
                style: "cancel",
                onPress: () => {
                  dispatch(deleteUserDataProcessing.request(choice));
                }
              }
            ];

      Alert.alert(
        getRequestProcessingAlertTitle()[choice],
        getRequestProcessingAlertSubtitle()[choice],
        alertButton
      );
    },
    [dispatch]
  );

  // Show an alert reporting the request has been submitted
  const handleUserDataRequestAlert = useCallback(
    (choice: UserDataProcessingChoiceEnum) => {
      const requestState = userDataProcessing[choice];

      if (
        pot.isSome(requestState) &&
        (requestState.value === undefined ||
          requestState.value.status === UserDataProcessingStatusEnum.CLOSED ||
          requestState.value.status === UserDataProcessingStatusEnum.ABORTED)
      ) {
        // if the user asks for download, navigate to a screen to inform about the process
        // there he/she can request to download his/her data
        if (choice === UserDataProcessingChoiceEnum.DOWNLOAD) {
          navigation.navigate(ROUTES.PROFILE_DOWNLOAD_DATA);
          return;
        }
      } else {
        handleAlreadyProcessingAlert(choice);
      }
    },
    [handleAlreadyProcessingAlert, navigation, userDataProcessing]
  );

  useEffect(() => {
    // If the new request submission fails, show an alert and hide the 'in progress' badge
    // if it is a get request after user click, check if shows the alert
    const checkUpdate = (
      errorMessage: string,
      choice: UserDataProcessingChoiceEnum
    ) => {
      const currentState = userDataProcessing[choice];

      if (
        prevUserDataProcessing &&
        pot.isLoading(prevUserDataProcessing[choice]) &&
        !pot.isLoading(currentState)
      ) {
        if (pot.isError(currentState)) {
          showToast(errorMessage);
        }
        // if the user asks for download/delete prompt an alert
        else if (requestProcess) {
          setRequestProcess(false);
          handleUserDataRequestAlert(choice);
        }
      }
    };
    checkUpdate(
      I18n.t("profile.main.privacy.exportData.error"),
      UserDataProcessingChoiceEnum.DOWNLOAD
    );

    checkUpdate(
      I18n.t("profile.main.privacy.removeAccount.error"),
      UserDataProcessingChoiceEnum.DELETE
    );
  }, [
    userDataProcessing,
    prevUserDataProcessing,
    requestProcess,
    handleUserDataRequestAlert
  ]);

  const isRequestProcessing = (choice: UserDataProcessingChoiceEnum): boolean =>
    !pot.isLoading(userDataProcessing[choice]) &&
    !pot.isError(userDataProcessing[choice]) &&
    pot.getOrElse(
      pot.map(
        userDataProcessing[choice],
        v =>
          v !== undefined &&
          v.status !== UserDataProcessingStatusEnum.CLOSED &&
          v.status !== UserDataProcessingStatusEnum.ABORTED
      ),
      false
    );

  return (
    <LoadingSpinnerOverlay
      isLoading={isLoading}
      loadingOpacity={0.9}
      loadingCaption={I18n.t("profile.main.privacy.loading")}
    >
      <TopScreenComponent
        goBack={() => navigation.goBack()}
        contextualHelpMarkdown={contextualHelpMarkdown}
        faqCategories={["privacy"]}
      >
        <ScreenContent
          title={I18n.t("profile.main.privacy.title")}
          subtitle={I18n.t("profile.main.privacy.subtitle")}
        >
          <List withContentLateralPadding={true}>
            {/* Privacy Policy */}
            <ListItemComponent
              title={I18n.t("profile.main.privacy.privacyPolicy.title")}
              subTitle={I18n.t(
                "profile.main.privacy.privacyPolicy.description"
              )}
              onPress={() => navigation.navigate(ROUTES.PROFILE_PRIVACY)}
              useExtendedSubTitle={true}
            />
            {/* Share data */}
            <ListItemComponent
              title={I18n.t("profile.main.privacy.shareData.listItem.title")}
              subTitle={I18n.t(
                "profile.main.privacy.shareData.listItem.description"
              )}
              onPress={() =>
                navigation.navigate(ROUTES.PROFILE_PRIVACY_SHARE_DATA)
              }
              useExtendedSubTitle={true}
            />
            {/* Export your data */}
            <ListItemComponent
              title={I18n.t("profile.main.privacy.exportData.title")}
              subTitle={I18n.t("profile.main.privacy.exportData.description")}
              onPress={() => {
                setRequestProcess(true);
                dispatch(
                  loadUserDataProcessing.request(
                    UserDataProcessingChoiceEnum.DOWNLOAD
                  )
                );
              }}
              useExtendedSubTitle={true}
              titleBadge={
                isRequestProcessing(UserDataProcessingChoiceEnum.DOWNLOAD)
                  ? I18n.t("profile.preferences.list.wip")
                  : undefined
              }
              testID="profile-export-data"
            />
            {/* Remove account */}
            <ListItemComponent
              title={I18n.t("profile.main.privacy.removeAccount.title")}
              subTitle={I18n.t(
                "profile.main.privacy.removeAccount.description"
              )}
              onPress={() => {
                if (isRequestProcessing(UserDataProcessingChoiceEnum.DELETE)) {
                  handleUserDataRequestAlert(
                    UserDataProcessingChoiceEnum.DELETE
                  );
                } else {
                  navigation.navigate(ROUTES.PROFILE_REMOVE_ACCOUNT_INFO);
                }
              }}
              useExtendedSubTitle={true}
              titleBadge={
                isRequestProcessing(UserDataProcessingChoiceEnum.DELETE)
                  ? I18n.t("profile.preferences.list.wip")
                  : undefined
              }
              testID="profile-delete"
            />
          </List>
        </ScreenContent>
      </TopScreenComponent>
    </LoadingSpinnerOverlay>
  );
};

export default PrivacyMainScreen;
