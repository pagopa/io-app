import { ContentWrapper, ListItemSwitch } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useDispatch } from "react-redux";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useEffect } from "react";
import { emptyContextualHelp } from "../../../utils/emptyContextualHelp.tsx";
import { IOScrollViewWithLargeHeader } from "../../../components/ui/IOScrollViewWithLargeHeader.tsx";
import { useIOSelector } from "../../../store/hooks.ts";
import { loadUserDataProcessing } from "../../settings/common/store/actions/userDataProcessing.ts";
import { UserDataProcessingChoiceEnum } from "../../../../definitions/backend/UserDataProcessingChoice.ts";
import { userDataProcessingSelector } from "../../settings/common/store/selectors/userDataProcessing.ts";
import { UserDataProcessingStatusEnum } from "../../../../definitions/backend/UserDataProcessingStatus.ts";
import { SETTINGS_ROUTES } from "../../settings/common/navigation/routes.ts";
import { IOStackNavigationProp } from "../../../navigation/params/AppParamsList.ts";
import { ToyProfileParamsList } from "../navigation/params.ts";
import { ProfileFields } from "../components/ProfileFields.tsx";
import { getToyProfileDetailsAction } from "../store/actions";

type Props = {
  navigation: IOStackNavigationProp<ToyProfileParamsList, "PROFILE_MAIN">;
};

const ProfileHomeScreen = ({ navigation }: Props) => {
  const dispatch = useDispatch();

  const deletePot = useIOSelector(
    s => userDataProcessingSelector(s)[UserDataProcessingChoiceEnum.DELETE]
  );

  useEffect(() => {
    dispatch(getToyProfileDetailsAction.request());
    dispatch(
      loadUserDataProcessing.request(UserDataProcessingChoiceEnum.DELETE)
    );
  }, [dispatch]);

  const delStatus = pot.isSome(deletePot) ? deletePot.value?.status : undefined;
  const delDisabled =
    pot.isLoading(deletePot) || pot.isNone(deletePot) || !!delStatus;
  const delValue =
    !!delStatus &&
    [
      UserDataProcessingStatusEnum.PENDING,
      UserDataProcessingStatusEnum.WIP,
      UserDataProcessingStatusEnum.CLOSED
    ].includes(delStatus);

  const onDeleteSwitchChange = (checked: boolean) => {
    if (checked) {
      navigation.navigate(SETTINGS_ROUTES.PROFILE_WARN);
    }
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
      <ContentWrapper>
        <ProfileFields />
        <ListItemSwitch
          disabled={delDisabled}
          icon="message"
          onSwitchValueChange={onDeleteSwitchChange}
          isLoading={pot.isLoading(deletePot)}
          label={I18n.t("profile.toy.main.deleteState")}
          value={delValue}
        />
      </ContentWrapper>
    </IOScrollViewWithLargeHeader>
  );
};

export { ProfileHomeScreen };
