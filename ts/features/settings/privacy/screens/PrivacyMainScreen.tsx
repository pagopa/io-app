import {
  Divider,
  IOToast,
  IOVisualCostants,
  ListItemNav
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import {
  ComponentProps,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { Alert, AlertButton, FlatList, ListRenderItemInfo } from "react-native";
import I18n from "i18next";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { IOStackNavigationProp } from "../../../../navigation/params/AppParamsList";
import { SettingsParamsList } from "../../common/navigation/params/SettingsParamsList";
import {
  deleteUserDataProcessing,
  loadUserDataProcessing
} from "../../common/store/actions/userDataProcessing";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { userDataProcessingSelector } from "../../common/store/selectors/userDataProcessing";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { usePrevious } from "../../../../utils/hooks/usePrevious";
import { SETTINGS_ROUTES } from "../../common/navigation/routes";
import { UserDataProcessingChoiceEnum } from "../../../../../definitions/backend/identity/UserDataProcessingChoice";
import { UserDataProcessingStatusEnum } from "../../../../../definitions/backend/identity/UserDataProcessingStatus";

type Props = {
  navigation: IOStackNavigationProp<SettingsParamsList, "PROFILE_PRIVACY_MAIN">;
};

const getRequestProcessingAlertTitle = () => ({
  DOWNLOAD: I18n.t("profile.main.privacy.exportData.alert.oldRequest"),
  DELETE: I18n.t("profile.main.privacy.removeAccount.alert.oldRequest")
});

const getRequestProcessingAlertSubtitle = () => ({
  DOWNLOAD: I18n.t("profile.main.privacy.exportData.alert.confirmSubtitle"),
  DELETE: I18n.t("profile.main.privacy.removeAccount.alert.oldRequestSubtitle")
});

type PrivacyNavListItem = {
  value: string;
} & Pick<
  ComponentProps<typeof ListItemNav>,
  "description" | "testID" | "onPress" | "topElement"
>;

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
  const canShowTooltipRef = useRef(true);
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
          navigation.navigate(SETTINGS_ROUTES.PROFILE_DOWNLOAD_DATA);
          return;
        }
        if (choice === UserDataProcessingChoiceEnum.DELETE) {
          navigation.navigate(SETTINGS_ROUTES.PROFILE_REMOVE_ACCOUNT_INFO);
          return;
        }
      } else {
        handleAlreadyProcessingAlert(choice);
      }
    },
    [handleAlreadyProcessingAlert, navigation, userDataProcessing]
  );

  // eslint-disable-next-line sonarjs/cognitive-complexity
  useEffect(() => {
    const prevIsLoading = (choice: UserDataProcessingChoiceEnum) =>
      prevUserDataProcessing && pot.isLoading(prevUserDataProcessing[choice]);
    const someWereLoading = (choices: Array<UserDataProcessingChoiceEnum>) =>
      choices.some(
        choice =>
          prevIsLoading(choice) && !pot.isLoading(userDataProcessing[choice])
      );
    const someHasError = (choices: Array<UserDataProcessingChoiceEnum>) =>
      choices.some(
        choice =>
          prevIsLoading(choice) && pot.isError(userDataProcessing[choice])
      );
    // If the new request submission fails, show an alert and hide the 'in progress' badge
    // if it is a get request after user click, check if shows the alert
    const checkUpdate = (
      errorMessage: string,
      choices: Array<UserDataProcessingChoiceEnum>
    ) => {
      if (someWereLoading(choices)) {
        if (someHasError(choices) && canShowTooltipRef.current) {
          // This reference ensures to display the toast message once between re-execution of this effect
          // eslint-disable-next-line functional/immutable-data
          canShowTooltipRef.current = false;

          IOToast.error(errorMessage);
        }
        // if the user asks for download/delete prompt an alert
        else if (requestProcess) {
          setRequestProcess(false);
          choices.forEach(choice => {
            if (
              prevIsLoading(choice) &&
              !pot.isLoading(userDataProcessing[choice])
            ) {
              handleUserDataRequestAlert(choice);
            }
          });
        }
      }
    };
    checkUpdate(I18n.t("profile.main.privacy.errorMessage"), [
      UserDataProcessingChoiceEnum.DOWNLOAD,
      UserDataProcessingChoiceEnum.DELETE
    ]);
  }, [
    userDataProcessing,
    prevUserDataProcessing,
    requestProcess,
    handleUserDataRequestAlert
  ]);

  const isRequestProcessing = useCallback(
    (choice: UserDataProcessingChoiceEnum): boolean =>
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
      ),
    [userDataProcessing]
  );
  const handleChoiceSelection = useCallback(
    (choice: UserDataProcessingChoiceEnum) => {
      if (pot.isError(userDataProcessing[choice])) {
        // eslint-disable-next-line functional/immutable-data
        canShowTooltipRef.current = true;
        setRequestProcess(true);
        dispatch(loadUserDataProcessing.request(choice));
      } else {
        handleUserDataRequestAlert(choice);
      }
    },
    [dispatch, handleUserDataRequestAlert, userDataProcessing]
  );

  const privacyNavListItems: ReadonlyArray<PrivacyNavListItem> = useMemo(
    () => [
      {
        // Privacy Policy
        value: I18n.t("profile.main.privacy.privacyPolicy.title"),
        description: I18n.t("profile.main.privacy.privacyPolicy.description"),
        onPress: () => navigation.navigate(SETTINGS_ROUTES.PROFILE_PRIVACY)
      },
      {
        // Share data
        value: I18n.t("profile.main.privacy.shareData.listItem.title"),
        description: I18n.t(
          "profile.main.privacy.shareData.listItem.description"
        ),
        onPress: () =>
          navigation.navigate(SETTINGS_ROUTES.PROFILE_PRIVACY_SHARE_DATA)
      },
      {
        // Export your data
        value: I18n.t("profile.main.privacy.exportData.title"),
        description: I18n.t("profile.main.privacy.exportData.description"),
        onPress: () => {
          handleChoiceSelection(UserDataProcessingChoiceEnum.DOWNLOAD);
        },
        topElement: isRequestProcessing(UserDataProcessingChoiceEnum.DOWNLOAD)
          ? {
              badgeProps: {
                text: I18n.t("profile.preferences.list.wip"),
                variant: "highlight"
              }
            }
          : undefined,
        testID: "profile-export-data"
      },
      {
        // Remove account
        value: I18n.t("profile.main.privacy.removeAccount.title"),
        description: I18n.t("profile.main.privacy.removeAccount.description"),
        onPress: () => {
          handleChoiceSelection(UserDataProcessingChoiceEnum.DELETE);
        },
        topElement: isRequestProcessing(UserDataProcessingChoiceEnum.DELETE)
          ? {
              badgeProps: {
                text: I18n.t("profile.preferences.list.wip"),
                variant: "highlight"
              }
            }
          : undefined,
        testID: "profile-delete"
      }
    ],

    [isRequestProcessing, navigation, handleChoiceSelection]
  );

  const renderPrivacyNavItem = useCallback(
    ({
      item: { value, description, onPress, topElement, testID }
    }: ListRenderItemInfo<PrivacyNavListItem>) => (
      <ListItemNav
        accessibilityLabel={`${value} ${description} ${
          topElement?.badgeProps?.text
            ? I18n.t("profile.main.privacy.status") +
              topElement.badgeProps?.text
            : ""
        }`}
        value={value}
        description={description}
        onPress={onPress}
        topElement={topElement}
        testID={testID}
      />
    ),
    []
  );

  const extractKey = useCallback(
    (item: PrivacyNavListItem, index: number) => `${item.value}-${index}`,
    []
  );

  return (
    <IOScrollViewWithLargeHeader
      title={{
        label: I18n.t("profile.main.privacy.title")
      }}
      description={I18n.t("profile.main.privacy.subtitle")}
      headerActionsProp={{ showHelp: true }}
    >
      <LoadingSpinnerOverlay
        isLoading={isLoading}
        loadingOpacity={0.9}
        loadingCaption={I18n.t("profile.main.privacy.loading")}
      >
        <FlatList
          scrollEnabled={false}
          data={privacyNavListItems}
          keyExtractor={extractKey}
          renderItem={renderPrivacyNavItem}
          ItemSeparatorComponent={Divider}
          contentContainerStyle={{
            paddingHorizontal: IOVisualCostants.appMarginDefault
          }}
        />
      </LoadingSpinnerOverlay>
    </IOScrollViewWithLargeHeader>
  );
};

export default PrivacyMainScreen;
