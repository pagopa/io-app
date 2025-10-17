import { FeatureInfo } from "@pagopa/io-app-design-system";
import { ComponentProps } from "react";
import I18n from "i18next";
import { IOScrollViewWithLargeHeader } from "../../../components/ui/IOScrollViewWithLargeHeader.tsx";
import { IOScrollView } from "../../../components/ui/IOScrollView.tsx";
import IOMarkdown from "../../../components/IOMarkdown";
import { IOStackNavigationProp } from "../../../navigation/params/AppParamsList.ts";
import { ToyProfileParamsList } from "../navigation/params.ts";
import { SETTINGS_ROUTES } from "../../settings/common/navigation/routes.ts";

type Props = {
  navigation: IOStackNavigationProp<ToyProfileParamsList, "PROFILE_WARN">;
};

export const ProfileWarnScreen = ({ navigation }: Props) => {
  const onCancelPress = () => {
    navigation.navigate(SETTINGS_ROUTES.PROFILE_MAIN);
  };

  const renderActionProps = (): ComponentProps<
    typeof IOScrollView
  >["actions"] => ({
    type: "TwoButtons",
    primary: {
      label: I18n.t("profile.toy.warn.buttons.cancel"),
      onPress: onCancelPress,
      testID: "addIbanButtonTestID"
    },
    secondary: {
      label: I18n.t("profile.toy.warn.buttons.continue"),
      onPress: () => {
        navigation.navigate(SETTINGS_ROUTES.PROFILE_CONFIRM_DELETE);
      },
      testID: "continueButtonTestID"
    }
  });

  return (
    <IOScrollViewWithLargeHeader
      includeContentMargins
      title={{
        label: I18n.t("profile.toy.warn.header"),
        section: I18n.t("profile.toy.warn.headerTitle")
      }}
      goBack={onCancelPress}
      headerActionsProp={{
        showHelp: true
      }}
      actions={renderActionProps()}
    >
      <FeatureInfo
        iconName="logout"
        body={<IOMarkdown content={I18n.t("profile.toy.warn.message")} />}
        variant={"neutral"}
      />
    </IOScrollViewWithLargeHeader>
  );
};
