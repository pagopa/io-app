import { useMemo, memo } from "react";
import { Badge, IOIcons, ModuleCredential } from "@pagopa/io-app-design-system";
import I18n from "../../../../i18n";
import { getCredentialNameFromType } from "../../common/utils/itwCredentialUtils";
import { CredentialType } from "../../common/utils/itwMocksUtils";

type Props = {
  type: string;
  onPress: (type: string) => void;
  isActive: boolean;
  isDisabled: boolean;
  isCredentialIssuancePending: boolean;
  isRequested: boolean;
  isSelectedCredential: boolean;
  isUpcoming: boolean;
};

const credentialIconByType: Record<string, IOIcons> = {
  [CredentialType.DRIVING_LICENSE]: "car",
  [CredentialType.EUROPEAN_DISABILITY_CARD]: "accessibility",
  [CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD]: "healthCard",
  [CredentialType.DEGREE_CERTIFICATES]: "messageLegal"
};

const activeBadge: Badge = {
  variant: "success",
  text: I18n.t("features.wallet.onboarding.badge.active")
};

const disabledBadge: Badge = {
  variant: "default",
  text: I18n.t("features.wallet.onboarding.badge.unavailable")
};

const requestedBadge: Badge = {
  variant: "highlight",
  text: I18n.t("features.wallet.onboarding.badge.requested")
};

const upcomingBadge: Badge = {
  variant: "default",
  text: I18n.t("features.wallet.onboarding.badge.upcoming")
};

const ItwOnboardingModuleCredential = ({
  type,
  onPress,
  isActive,
  isDisabled,
  isRequested,
  isUpcoming,
  isSelectedCredential,
  isCredentialIssuancePending
}: Props) => {
  const badge = useMemo((): Badge | undefined => {
    if (isActive) {
      return activeBadge;
    }
    if (isDisabled) {
      return disabledBadge;
    }
    if (isRequested) {
      return requestedBadge;
    }
    if (isUpcoming) {
      return upcomingBadge;
    }
    return undefined;
  }, [isActive, isDisabled, isRequested, isUpcoming]);

  const handleOnPress = () => {
    onPress(type);
  };

  const isPressable = !(isActive || isDisabled);

  return (
    <ModuleCredential
      testID={`${type}ModuleTestID`}
      icon={credentialIconByType[type]}
      label={getCredentialNameFromType(type)}
      onPress={isPressable ? handleOnPress : undefined}
      isFetching={isCredentialIssuancePending && isSelectedCredential}
      badge={badge}
    />
  );
};

const MemoizedComponent = memo(ItwOnboardingModuleCredential);
export { MemoizedComponent as ItwOnboardingModuleCredential };
