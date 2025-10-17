import {
  ContentWrapper,
  Divider,
  ListItemInfo,
  ListItemSwitch
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useDispatch } from "react-redux";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useEffect } from "react";
import { emptyContextualHelp } from "../../../utils/emptyContextualHelp.tsx";
import { IOScrollViewWithLargeHeader } from "../../../components/ui/IOScrollViewWithLargeHeader.tsx";
import { getToyProfileDetailsAction } from "../store/actions";
import { toyProfileSelector } from "../store/selectors";
import { useIOSelector } from "../../../store/hooks.ts";
import { loadUserDataProcessing } from "../../settings/common/store/actions/userDataProcessing.ts";
import { UserDataProcessingChoiceEnum } from "../../../../definitions/backend/UserDataProcessingChoice.ts";
import { userDataProcessingSelector } from "../../settings/common/store/selectors/userDataProcessing.ts";
import LoadingSpinnerOverlay from "../../../components/LoadingSpinnerOverlay.tsx";
import { UserDataProcessingStatusEnum } from "../../../../definitions/backend/UserDataProcessingStatus.ts";

const ProfileHomeScreen = () => {
  const dispatch = useDispatch();

  const toyProfilePot = useIOSelector(toyProfileSelector);
  const deletePot = useIOSelector(
    s => userDataProcessingSelector(s)[UserDataProcessingChoiceEnum.DELETE]
  );

  useEffect(() => {
    dispatch(getToyProfileDetailsAction.request());
    dispatch(
      loadUserDataProcessing.request(UserDataProcessingChoiceEnum.DELETE)
    );
  }, [dispatch]);

  const profile = pot.isSome(toyProfilePot) ? toyProfilePot.value : undefined;

  const delIsLoading = pot.isLoading(deletePot);
  const delIsSome = pot.isSome(deletePot);
  const delStatus = delIsSome ? deletePot.value?.status : undefined;
  const delDisabled = delIsLoading || pot.isNone(deletePot);
  const delValue =
    !!delStatus &&
    [
      UserDataProcessingStatusEnum.PENDING,
      UserDataProcessingStatusEnum.WIP,
      UserDataProcessingStatusEnum.CLOSED
    ].includes(delStatus);

  const onDeleteSwitchChange = (checked: boolean) => {
    // TODO
  };

  return (
    <IOScrollViewWithLargeHeader
      title={{
        label: I18n.t("features.profile.title")
      }}
      contextualHelp={emptyContextualHelp}
      faqCategories={["profile"]}
      headerActionsProp={{ showHelp: true }}
    >
      <LoadingSpinnerOverlay
        isLoading={pot.isNone(toyProfilePot) || pot.isLoading(toyProfilePot)}
        loadingOpacity={0.9}
        loadingCaption={I18n.t("profile.main.privacy.loading")}
      >
        <ContentWrapper>
          {pot.isError(toyProfilePot) && (
            <ListItemInfo value={toyProfilePot.error.message} />
          )}

          {profile && (
            <>
              {profile.name && profile.family_name && (
                <>
                  <ListItemInfo
                    label={I18n.t("profile.data.list.nameSurname")}
                    icon="profile"
                    value={`${profile.name} ${profile.family_name}`}
                  />
                  <Divider />
                </>
              )}

              {profile.fiscal_code && (
                <>
                  <ListItemInfo
                    label={I18n.t("profile.data.list.fiscalCode")}
                    icon="fiscalCodeIndividual"
                    value={profile.fiscal_code}
                  />
                  <Divider />
                </>
              )}

              {profile.email && (
                <>
                  <ListItemInfo
                    label={I18n.t("profile.data.list.email")}
                    icon="email"
                    value={profile.email}
                  />
                  <Divider />
                </>
              )}

              {profile.date_of_birth && (
                <>
                  <ListItemInfo
                    label={I18n.t("profile.data.list.birthDate")}
                    icon="calendar"
                    value={profile.date_of_birth.toLocaleDateString()}
                  />
                  <Divider />
                </>
              )}
              {delIsSome && (
                <ListItemSwitch
                  disabled={delDisabled}
                  icon="message"
                  onSwitchValueChange={onDeleteSwitchChange}
                  isLoading={delIsLoading || !delIsSome}
                  label={I18n.t("profile.data.deleteState")}
                  value={delValue}
                />
              )}
            </>
          )}
        </ContentWrapper>
      </LoadingSpinnerOverlay>
    </IOScrollViewWithLargeHeader>
  );
};

export { ProfileHomeScreen };
