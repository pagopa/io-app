import React from "react";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/lib/function";
import {
  IOColors,
  ContentWrapper,
  VSpacer,
  Divider
} from "@pagopa/io-app-design-system";
import { ScrollView, StatusBar } from "react-native";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { EidCard } from "../../common/components/EidCard";
import { ItwCredentialClaimsSection } from "../../common/components/ItwCredentialClaimsSection";
import { ItwPidAssuranceLevel } from "../../common/components/ItwPidAssuranceLevel";
import { ItwReleaserName } from "../../common/components/ItwReleaserName";
import {
  ItWalletError,
  getItwGenericMappedError
} from "../../common/utils/itwErrorsUtils";
import { ItwCredentialsMocks } from "../../common/utils/itwMocksUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";

const ContentView = ({ eid }: { eid: StoredCredential }) => (
  <ContentWrapper>
    <ScrollView>
      <EidCard />
      <VSpacer size={24} />
      <ItwCredentialClaimsSection
        title={I18n.t("features.itWallet.presentation.personalDataTitle")}
        canHideValues
        claims={[]}
      />
      <VSpacer size={24} />
      <ItwCredentialClaimsSection
        title={I18n.t("features.itWallet.presentation.documentDataTitle")}
        claims={[]}
      />
      <Divider />
      <ItwPidAssuranceLevel credential={eid} />
      <Divider />
      <ItwReleaserName credential={eid} />
    </ScrollView>
  </ContentWrapper>
);

export const ItwPresentationEidDetailScreen = () => {
  const navigation = useIONavigation();
  const eidOption = O.some(ItwCredentialsMocks.eid);

  useHeaderSecondLevel({
    title: "",
    supportRequest: true
  });

  /**
   * Error view component which currently displays a generic error.
   * @param error - optional ItWalletError to be displayed.
   */
  const ErrorView = ({ error: _ }: { error?: ItWalletError }) => {
    const mappedError = getItwGenericMappedError(() => navigation.goBack());
    return <OperationResultScreenContent {...mappedError} />;
  };

  return (
    <>
      <StatusBar
        backgroundColor={IOColors.bluegrey}
        barStyle={"dark-content"}
      />

      {pipe(
        eidOption,
        O.fold(
          () => <ErrorView />,
          eid => <ContentView eid={eid} />
        )
      )}
    </>
  );
};
