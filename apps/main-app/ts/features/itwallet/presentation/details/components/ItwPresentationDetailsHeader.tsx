import {
  Body,
  ContentWrapper,
  H2,
  makeFontStyleObject,
  Tag,
  useIOExperimentalDesign
} from "@io-app/design-system";
import Color from "color";
import { memo, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import ItwAvatar from "../../../../../../img/features/itWallet/brand/itw_avatar.svg";
import FocusAwareStatusBar from "../../../../../components/ui/FocusAwareStatusBar.tsx";
import { useIOSelector } from "../../../../../store/hooks.ts";
import { useCredentialCardConfig } from "../../../common/components/ItwCredentialCard/config.ts";
import { ItwCredentialDetailCard } from "../../../common/components/ItwCredentialDetailCard.tsx";
import { useItwAuthSourceName } from "../../../common/hooks/useItwAuthSourceName.ts";
import { useItwCredentialName } from "../../../common/hooks/useItwCredentialName.ts";
import { useTagPropsByStatus } from "../../../common/utils/itwCredentialUtils.ts";
import { CredentialType } from "../../../common/utils/itwMocksUtils.ts";
import { useThemeColorByCredentialType } from "../../../common/utils/itwStyleUtils.ts";
import { CredentialMetadata } from "../../../common/utils/itwTypesUtils.ts";
import {
  itwCredentialsEidStatusSelector,
  itwCredentialStatusSelector
} from "../../../credentials/store/selectors";
import { useItwDisplayCredentialStatus } from "../hooks/useItwDisplayCredentialStatus";
import { ItwPresentationCredentialCard } from "./ItwPresentationCredentialCard.tsx";

type ItwPresentationDetailsHeaderProps = {
  credential: CredentialMetadata;
};

const credentialsWithSkeumorphicCard: ReadonlyArray<string> = [
  CredentialType.DRIVING_LICENSE,
  CredentialType.EUROPEAN_DISABILITY_CARD
];

const ItwPresentationDetailsHeader = ({
  credential
}: ItwPresentationDetailsHeaderProps) => {
  // Credential's header card is always in light mode
  const { color } = useCredentialCardConfig(credential.credentialType, "light");
  const eidStatus = useIOSelector(itwCredentialsEidStatusSelector);
  const { status: credentialRawStatus } = useIOSelector(state =>
    itwCredentialStatusSelector(state, credential.credentialType)
  );
  // PID is excluded from itwCredentialStatusSelector, so read its status from eidStatus directly
  const rawStatus =
    credential.credentialType === CredentialType.PID
      ? (eidStatus ?? "valid")
      : (credentialRawStatus ?? "valid");
  const displayStatus = useItwDisplayCredentialStatus(rawStatus);
  const tagPropsByStatus = useTagPropsByStatus();
  const statusTagProps = tagPropsByStatus[displayStatus];

  const authSourceName = useItwAuthSourceName(credential.credentialType);
  const credentialName = useItwCredentialName(credential.credentialType);

  const isLight = useMemo(() => Color(color).isLight(), [color]);

  return (
    <>
      <FocusAwareStatusBar
        backgroundColor={color}
        barStyle={isLight ? "dark-content" : "light-content"}
      />

      <ItwCredentialDetailCard
        credentialStatus={displayStatus}
        credentialType={credential.credentialType}
      >
        <ItwAvatar height={48} width={48} />
        <H2
          color={isLight ? "blueItalia-850" : "white"}
          style={styles.nameText}
        >
          {credentialName}
        </H2>
        {authSourceName && (
          <Body
            color={isLight ? "blueItalia-850" : "white"}
            style={styles.authSourceText}
          >
            {authSourceName}
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

/**
 * @deprecated Legacy header component for presentation details, to be used until the new design is enabled for all users.
 */
const ItwPresentationDetailsHeaderLegacy = ({
  credential
}: ItwPresentationDetailsHeaderProps) => {
  const { isExperimental } = useIOExperimentalDesign();
  const { statusBarStyle, backgroundColor, textColor } =
    useThemeColorByCredentialType(credential.credentialType);
  const credentialName = useItwCredentialName(credential.credentialType);

  const headerContent = useMemo(() => {
    if (credentialsWithSkeumorphicCard.includes(credential.credentialType)) {
      return <ItwPresentationCredentialCard credential={credential} />;
    }

    return (
      <View style={[styles.legacyHeader, { backgroundColor }]}>
        <ContentWrapper>
          <Text
            accessibilityRole="header"
            style={[
              isExperimental
                ? styles.legacyHeaderLabelExperimental
                : styles.legacyHeaderLabel,
              { color: textColor }
            ]}
          >
            {credentialName}
          </Text>
        </ContentWrapper>
      </View>
    );
  }, [credential, backgroundColor, textColor, isExperimental, credentialName]);

  return (
    <>
      <FocusAwareStatusBar
        backgroundColor={backgroundColor}
        barStyle={statusBarStyle}
      />
      {headerContent}
    </>
  );
};

const styles = StyleSheet.create({
  nameText: {
    textAlign: "center",
    marginTop: 16
  },
  authSourceText: {
    textAlign: "center",
    marginHorizontal: 16,
    paddingTop: 4
  },
  legacyHeader: {
    marginTop: -300,
    paddingTop: 300,
    justifyContent: "flex-end",
    paddingBottom: 24
  },
  legacyHeaderLabel: {
    ...makeFontStyleObject(26, "TitilliumSansPro", 30, "Semibold")
  },
  legacyHeaderLabelExperimental: {
    ...makeFontStyleObject(26, "Titillio", 30, "Semibold")
  }
});

const MemoizedItwPresentationDetailsHeader = memo(ItwPresentationDetailsHeader);

/**
 * @deprecated
 */
const MemoizedItwPresentationDetailsHeaderLegacy = memo(
  ItwPresentationDetailsHeaderLegacy
);

export {
  MemoizedItwPresentationDetailsHeader as ItwPresentationDetailsHeader,
  MemoizedItwPresentationDetailsHeaderLegacy as ItwPresentationDetailsHeaderLegacy
};
