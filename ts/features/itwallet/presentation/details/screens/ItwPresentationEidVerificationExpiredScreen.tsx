import { BodyProps } from "@pagopa/io-app-design-system";
import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent.tsx";
import I18n from "../../../../../i18n.ts";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList.ts";
import { ITW_ROUTES } from "../../../navigation/routes.ts";

export const ItwPresentationEidVerificationExpiredScreen = () => {
  const navigation = useIONavigation();

  const startEidReissuing = () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.IDENTIFICATION.MODE_SELECTION.L2,
      params: {
        eidReissuing: true
      }
    });
  };

  const bodyPropsArray: Array<BodyProps> = [
    {
      text: I18n.t(
        "features.itWallet.presentation.eid.verificationExpired.contentStart"
      ),
      style: {
        textAlign: "center"
      }
    },
    {
      text: I18n.t(
        "features.itWallet.presentation.eid.verificationExpired.contentBold"
      ),
      weight: "Semibold",
      style: {
        textAlign: "center"
      }
    },
    {
      text: I18n.t(
        "features.itWallet.presentation.eid.verificationExpired.contentEnd"
      ),
      style: {
        textAlign: "center"
      }
    }
  ];

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
