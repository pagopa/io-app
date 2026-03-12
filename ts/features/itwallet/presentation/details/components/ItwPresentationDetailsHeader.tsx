import { Body, H2, Tag } from "@pagopa/io-app-design-system";
import { memo } from "react";
import { View } from "react-native";
import FocusAwareStatusBar from "../../../../../components/ui/FocusAwareStatusBar.tsx";
import { useIOSelector } from "../../../../../store/hooks.ts";
import ItwAvatar from "../../../../../../img/features/itWallet/brand/itw_avatar.svg";
import { ItwCredentialDetailCard } from "../../../common/components/ItwCredentialDetailCard.tsx";
import { getItwAuthSource } from "../../../common/utils/itwMetadataUtils.ts";
import {
  getCredentialNameFromType,
  tagPropsByStatus
} from "../../../common/utils/itwCredentialUtils.ts";
import { useThemeColorByCredentialType } from "../../../common/utils/itwStyleUtils.ts";
import { StoredCredential } from "../../../common/utils/itwTypesUtils.ts";
import { itwCredentialsCatalogueByTypesSelector } from "../../../credentialsCatalogue/store/selectors";
import { itwCredentialStatusSelector } from "../../../credentials/store/selectors";
import { useItwDisplayCredentialStatus } from "../hooks/useItwDisplayCredentialStatus";

type ItwPresentationDetailsHeaderProps = {
  credential: StoredCredential;
};

const ItwPresentationDetailsHeader = ({
  credential
}: ItwPresentationDetailsHeaderProps) => {
  const { statusBarStyle, backgroundColor } = useThemeColorByCredentialType(
    credential.credentialType
  );
  const { status: rawStatus = "valid" } = useIOSelector(state =>
    itwCredentialStatusSelector(state, credential.credentialType)
  );
  const displayStatus = useItwDisplayCredentialStatus(rawStatus);
  const statusTagProps = tagPropsByStatus[displayStatus];
  const credentialsCatalogue = useIOSelector(
    itwCredentialsCatalogueByTypesSelector
  );
  const authSource = credentialsCatalogue?.[credential.credentialType]
    ? getItwAuthSource(credentialsCatalogue[credential.credentialType])
    : undefined;

  return (
    <>
      <FocusAwareStatusBar
        backgroundColor={backgroundColor}
        barStyle={statusBarStyle}
      />
      <ItwCredentialDetailCard
        credentialType={credential.credentialType}
        credentialStatus={displayStatus}
      >
        <ItwAvatar width={48} height={48} />
        <H2 style={{ paddingTop: 16, textAlign: "center" }}>
          {getCredentialNameFromType(credential.credentialType)}
        </H2>
        {authSource && (
          <Body
            style={{ textAlign: "center", marginHorizontal: 32, paddingTop: 4 }}
          >
            {authSource}
          </Body>
        )}
        {statusTagProps && (
          <View style={{ marginTop: 16 }}>
            <Tag forceLightMode {...statusTagProps} />
          </View>
        )}
      </ItwCredentialDetailCard>
    </>
  );
};

const MemoizedItwPresentationDetailsHeader = memo(ItwPresentationDetailsHeader);

export { MemoizedItwPresentationDetailsHeader as ItwPresentationDetailsHeader };
