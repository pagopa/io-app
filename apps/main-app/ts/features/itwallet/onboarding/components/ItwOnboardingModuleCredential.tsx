import { Badge, IOIcons, ModuleCredential } from "@io-app/design-system";
import I18n from "i18next";
import { memo, useMemo } from "react";

import { useIOSelector } from "../../../../store/hooks";
import { itwIsL3EnabledSelector } from "../../common/store/selectors";
import { CredentialType } from "../../common/utils/itwMocksUtils";

type Props = {
  credentialName: string;
  isActive?: boolean;
  isCredentialIssuancePending?: boolean;
  isDisabled?: boolean;
  isNew?: boolean;
  isRequested?: boolean;
  isSelectedCredential?: boolean;
  isUpcoming?: boolean;
  onPress: (type: string) => void;
  showIcon?: boolean;
  type: string;
};

const credentialIconByType: Record<string, IOIcons> = {
  [CredentialType.DRIVING_LICENSE]: "car",
  [CredentialType.EUROPEAN_DISABILITY_CARD]: "accessibility",
  [CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD]: "healthCard",
  [CredentialType.EDUCATION_DEGREE]: "messageLegal",
  [CredentialType.EDUCATION_ENROLLMENT]: "messageLegal",
  [CredentialType.RESIDENCY]: "messageLegal",
  [CredentialType.EDUCATION_DIPLOMA]: "messageLegal",
  [CredentialType.EDUCATION_ATTENDANCE]: "messageLegal"
};

const ItwOnboardingModuleCredential = ({
  type,
  onPress,
  showIcon = true,
  isActive,
  isDisabled,
  isUpcoming,
  isNew,
  isSelectedCredential,
  isCredentialIssuancePending,
  isRequested = false,
  credentialName
}: Props) => {
  const isL3Enabled = useIOSelector(itwIsL3EnabledSelector);

  const badge = useMemo((): Badge | undefined => {
    if (isActive) {
      return {
        variant: "success",
        text: I18n.t(
          isL3Enabled
            ? "features.wallet.onboarding.badge.valid"
            : "features.wallet.onboarding.badge.active"
        )
      };
    }
    if (isDisabled) {
      return {
        variant: "default",
        text: I18n.t("features.wallet.onboarding.badge.unavailable")
      };
    }
    if (isRequested) {
      return {
        variant: "highlight",
        text: I18n.t("features.wallet.onboarding.badge.requested")
      };
    }
    if (isUpcoming) {
      return {
        variant: "default",
        text: I18n.t("features.wallet.onboarding.badge.upcoming")
      };
    }
    if (isNew) {
      return {
        variant: "default",
        text: I18n.t("features.wallet.onboarding.badge.new")
      };
    }
    return undefined;
  }, [isActive, isDisabled, isRequested, isUpcoming, isNew, isL3Enabled]);

  const handleOnPress = () => {
    onPress(type);
  };

  const isPressable = !(isActive || isDisabled);

  const baseProps = {
    testID: `${type}ModuleTestID`,
    label: credentialName,
    onPress: isPressable ? handleOnPress : undefined,
    isFetching: isCredentialIssuancePending && isSelectedCredential,
    badge
  };

  const icon = showIcon ? credentialIconByType[type] : undefined;

  return icon ? (
    <ModuleCredential {...baseProps} icon={icon as IOIcons} />
  ) : (
    <ModuleCredential {...baseProps} />
  );
};

const MemoizedComponent = memo(ItwOnboardingModuleCredential);
export { MemoizedComponent as ItwOnboardingModuleCredential };
