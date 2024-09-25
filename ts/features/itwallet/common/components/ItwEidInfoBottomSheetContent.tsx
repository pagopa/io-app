import React from "react";
import { View } from "react-native";
import {
  Alert,
  Divider,
  HStack,
  Icon,
  IOStyles,
  VStack,
  H4
} from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import { constNull, pipe } from "fp-ts/lib/function";
import I18n from "../../../../i18n";
import { useIOSelector } from "../../../../store/hooks";
import { itwCredentialsEidSelector } from "../../credentials/store/selectors";
import IOMarkdown from "../../../../components/IOMarkdown";
import { parseClaims, WellKnownClaim } from "../utils/itwClaimsUtils";
import { StoredCredential } from "../utils/itwTypesUtils";
import { ItwCredentialClaim } from "./ItwCredentialClaim";

export const ItwEidInfoBottomSheetTitle = () => (
  <HStack space={8} style={IOStyles.alignCenter}>
    <Icon name="legalValue" color="blueIO-500" />
    <H4>
      {I18n.t("features.itWallet.presentation.bottomSheets.eidInfo.title")}
    </H4>
  </HStack>
);

export const ItwEidInfoBottomSheetContent = () => {
  const eidOption = useIOSelector(itwCredentialsEidSelector);

  const Content = ({ credential }: { credential: StoredCredential }) => {
    const claims = parseClaims(credential.parsedCredential, {
      exclude: [WellKnownClaim.unique_id, WellKnownClaim.content]
    });

    return (
      <VStack space={24}>
        <IOMarkdown
          content={I18n.t(
            "features.itWallet.presentation.bottomSheets.eidInfo.contentTop"
          )}
        />
        <View>
          {claims.map((claim, index) => (
            <React.Fragment key={index}>
              {index !== 0 && <Divider />}
              <ItwCredentialClaim claim={claim} isPreview={true} />
            </React.Fragment>
          ))}
        </View>
        <IOMarkdown
          content={I18n.t(
            "features.itWallet.presentation.bottomSheets.eidInfo.contentBottom"
          )}
        />
        <Alert
          variant="success"
          content="L'ultima verifica con CIE è del 19/07/2024."
        />
      </VStack>
    );
  };

  return pipe(
    eidOption,
    O.fold(
      constNull, // This should never happen
      credential => <Content credential={credential} />
    )
  );
};
