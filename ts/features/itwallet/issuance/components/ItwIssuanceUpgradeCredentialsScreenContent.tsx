import {
  HeaderSecondLevel,
  IOButtonProps,
  IOPictograms
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { ComponentProps, PropsWithChildren } from "react";
import { useNavigation } from "@react-navigation/native";
import { IOScrollViewCentredContent } from "../../../../components/ui/IOScrollViewCentredContent";

import { BackProps, useHeaderProps } from "../../../../hooks/useHeaderProps";

type ButtonProps = Pick<
  IOButtonProps,
  "label" | "accessibilityLabel" | "onPress" | "testID" | "icon"
>;

type ItwIssuanceUpgradeCredentialsScreenContentProps = {
  pictogram: IOPictograms;
  title: string;
  subtitle?: string;
  action: ButtonProps;
  disableAnimatedPictogram?: boolean;
  ignoreSafeAreaMargin?: ComponentProps<
    typeof HeaderSecondLevel
  >["ignoreSafeAreaMargin"];
  ignoreAccessibilityCheck?: ComponentProps<
    typeof HeaderSecondLevel
  >["ignoreAccessibilityCheck"];
  goBack?: BackProps["goBack"];
};
const ItwIssuanceUpgradeCredentialsScreenContent = ({
  pictogram,
  title,
  subtitle,
  action,
  ignoreSafeAreaMargin = false,
  ignoreAccessibilityCheck = false,
  goBack
}: PropsWithChildren<ItwIssuanceUpgradeCredentialsScreenContentProps>) => {
  const navigation = useNavigation();

  const headerProps: ComponentProps<typeof HeaderSecondLevel> = {
    ignoreSafeAreaMargin,
    ignoreAccessibilityCheck,
    ...useHeaderProps({
      title,
      backAccessibilityLabel: I18n.t("global.buttons.back"),
      goBack: goBack ?? navigation.goBack,
      showHelp: true
    })
  };

  return (
    <IOScrollViewCentredContent
      pictogram={pictogram}
      title={title}
      description={subtitle}
      headerConfig={headerProps}
      actions={{
        type: "SingleButton",
        primary: {
          color: "primary",
          label: action.label,
          onPress: action?.onPress
        }
      }}
    />
  );
};

export { ItwIssuanceUpgradeCredentialsScreenContent };
export type { ItwIssuanceUpgradeCredentialsScreenContentProps };
