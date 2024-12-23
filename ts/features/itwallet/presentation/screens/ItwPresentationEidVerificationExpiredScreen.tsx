import React, { useMemo } from "react";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { BodyProps } from "@pagopa/io-app-design-system";
import { ITW_ROUTES } from "../../navigation/routes";

export const ItwPresentationEidVerificationExpiredScreen = () => {
  const navigation = useIONavigation();

  useHeaderSecondLevel({
    title: "",
    headerShown: false
  });

  const startEidReissuing = () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.IDENTIFICATION.MODE_SELECTION,
      params: {
        eidReissuing: true
      }
    });
  };

  const bodyPropsArray: Array<BodyProps> = useMemo(
    () => [
      {
        text: I18n.t("features.itWallet.presentation.eid.verificationExpired.contentStart"),
        style: {
          textAlign: "center"
        }
      },
      {
        text: I18n.t("features.itWallet.presentation.eid.verificationExpired.contentBold"),
        style: {
          textAlign: "center",
          fontWeight: "bold"
        }
      },
      {
        text: I18n.t("features.itWallet.presentation.eid.verificationExpired.contentEnd"),
        style: {
          textAlign: "center"
        }
      }
    ],
    []
  );

  return (
    <OperationResultScreenContent
      pictogram="identityRefresh"
      title={I18n.t(
        "features.itWallet.presentation.eid.verificationExpired.title"
      )}
      subtitle={bodyPropsArray}
      action={{
        label: I18n.t(
          "features.itWallet.presentation.eid.verificationExpired.primaryAction"
        ),
        onPress: startEidReissuing
      }}
      secondaryAction={{
        label: I18n.t("global.buttons.cancel"),
        onPress: () => navigation.goBack()
      }}
    />
  );
};
