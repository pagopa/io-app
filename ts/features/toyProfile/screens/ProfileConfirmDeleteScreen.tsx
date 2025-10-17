import { ComponentProps } from "react";
import I18n from "i18next";
import { useDispatch } from "react-redux";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { ListItemInfo, LoadingSpinner } from "@pagopa/io-app-design-system";
import { IOScrollView } from "../../../components/ui/IOScrollView.tsx";
import { IOStackNavigationProp } from "../../../navigation/params/AppParamsList.ts";
import { ToyProfileParamsList } from "../navigation/params.ts";
import { IOScrollViewWithLargeHeader } from "../../../components/ui/IOScrollViewWithLargeHeader.tsx";
import { ProfileFields } from "../components/ProfileFields.tsx";
import { useIOSelector } from "../../../store/hooks.ts";
import { userDataProcessingSelector } from "../../settings/common/store/selectors/userDataProcessing.ts";
import { UserDataProcessingChoiceEnum } from "../../../../definitions/backend/UserDataProcessingChoice.ts";
import { upsertUserDataProcessing } from "../../settings/common/store/actions/userDataProcessing.ts";

type Props = {
  navigation: IOStackNavigationProp<
    ToyProfileParamsList,
    "PROFILE_CONFIRM_DELETE"
  >;
};

export const ProfileConfirmDeleteScreen = ({ navigation }: Props) => {
  const dispatch = useDispatch();

  const deletePot = useIOSelector(
    s => userDataProcessingSelector(s)[UserDataProcessingChoiceEnum.DELETE]
  );

  const delHasValue = pot.isSome(deletePot) && deletePot.value?.status;

  const renderActionProps = (): ComponentProps<
    typeof IOScrollView
  >["actions"] => {
    const onDeletePress = () => {
      dispatch(
        upsertUserDataProcessing.request(UserDataProcessingChoiceEnum.DELETE)
      );
    };

    if (pot.isError(deletePot)) {
      return {
        type: "TwoButtons",
        primary: {
          label: I18n.t("profile.toy.confirm_delete.buttons.cancel"),
          onPress: navigation.popToTop
        },
        secondary: {
          label: I18n.t("profile.toy.confirm_delete.buttons.retry"),
          onPress: onDeletePress
        }
      };
    }

    if (delHasValue) {
      return {
        type: "SingleButton",
        primary: {
          label: I18n.t("profile.toy.confirm_delete.buttons.close"),
          onPress: navigation.popToTop
        }
      };
    }

    return {
      type: "TwoButtons",
      primary: {
        label: I18n.t("profile.toy.confirm_delete.buttons.cancel"),
        onPress: navigation.popToTop
      },
      secondary: {
        label: I18n.t("profile.toy.confirm_delete.buttons.continue"),
        onPress: onDeletePress
      }
    };
  };

  return (
    <IOScrollViewWithLargeHeader
      includeContentMargins
      title={{
        label: I18n.t(
          delHasValue
            ? "profile.toy.confirm_delete.header_deleted"
            : "profile.toy.confirm_delete.header"
        )
      }}
      headerActionsProp={{
        showHelp: true
      }}
      actions={renderActionProps()}
    >
      {pot.isError(deletePot) && (
        <ListItemInfo value={deletePot.error.message} />
      )}
      {pot.isLoading(deletePot) && <LoadingSpinner />}
      {!delHasValue && <ProfileFields />}
      {delHasValue && (
        <ListItemInfo value={I18n.t("profile.toy.confirm_delete.deleted")} />
      )}
    </IOScrollViewWithLargeHeader>
  );
};
