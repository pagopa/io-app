import { ContentWrapper, H2 } from "@pagopa/io-app-design-system";
import React from "react";
import { View } from "react-native";
import FocusAwareStatusBar from "../../../../components/ui/FocusAwareStatusBar";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { CredentialType } from "../../common/utils/itwMocksUtils";
import {
  getHeaderPropsyCredentialType,
  getThemeColorByCredentialType
} from "../../common/utils/itwStyleUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { getCredentialNameFromType } from "../../common/utils/itwCredentialUtils";
import { ItwPresentationCredentialCard } from "./ItwPresentationCredentialCard";

type ItwPresentationDetailsHeaderProps = { credential: StoredCredential };

const ItwPresentationDetailsHeader = ({
  credential
}: ItwPresentationDetailsHeaderProps) => {
  const themeColor = getThemeColorByCredentialType(
    credential.credentialType as CredentialType
  );
  const headerProps = getHeaderPropsyCredentialType(credential.credentialType);

  useHeaderSecondLevel(headerProps);

  const hasCard =
    credential.credentialType !== CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD;

  return (
    <>
      <FocusAwareStatusBar
        backgroundColor={themeColor}
        barStyle="light-content"
      />
      {hasCard ? (
        <ItwPresentationCredentialCard credential={credential} />
      ) : (
        <View
          style={{
            backgroundColor: themeColor,
            paddingBottom: 24
          }}
        >
          <ContentWrapper>
            <H2 color="blueIO-850">
              {getCredentialNameFromType(credential.credentialType)}
            </H2>
          </ContentWrapper>
        </View>
      )}
    </>
  );
};

const MemoizedItwPresentationDetailsHeader = React.memo(
  ItwPresentationDetailsHeader
);

export { MemoizedItwPresentationDetailsHeader as ItwPresentationDetailsHeader };
