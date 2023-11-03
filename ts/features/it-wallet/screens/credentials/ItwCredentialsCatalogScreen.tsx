import React, { useEffect } from "react";
import { FlatList, SafeAreaView, View } from "react-native";
import {
  Badge,
  H2,
  IOStyles,
  Icon,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import * as pot from "@pagopa/ts-commons/lib/pot";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import ItwSearchBar from "../../components/ItwSearchBar";
import I18n from "../../../../i18n";
import {
  CREDENTIALS_CATALOG,
  CredentialCatalogAvailableItem,
  CredentialCatalogItem
} from "../../utils/mocks";
import ListItemLoadingItw from "../../components/ListItems/ListItemLoadingItw";
import { IOStackNavigationProp } from "../../../../navigation/params/AppParamsList";
import { ItwParamsList } from "../../navigation/ItwParamsList";
import { ITW_ROUTES } from "../../navigation/ItwRoutes";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { itwIssuanceChecksSelector } from "../../store/reducers/new/itwIssuanceReducer";
import { itwIssuanceChecks } from "../../store/actions/new/itwIssuanceActions";

const NONE_LOADING = -1;

/**
 * Renders a preview screen which displays a visual representation and the claims contained in the PID.
 */
const ItwCredentialsCatalogScreen = () => {
  const dispatch = useIODispatch();
  const navigation = useNavigation<IOStackNavigationProp<ItwParamsList>>();
  const preliminaryChecks = useIOSelector(itwIssuanceChecksSelector);
  const [loadingIndex, setLoadingIndex] = React.useState<number>(NONE_LOADING);

  useEffect(() => {
    if (
      loadingIndex !== NONE_LOADING &&
      !pot.isLoading(preliminaryChecks) &&
      !pot.isNone(preliminaryChecks)
    ) {
      setLoadingIndex(-1);
      navigation.navigate(ITW_ROUTES.CREDENTIALS.CHECKS);
    }
  }, [loadingIndex, navigation, preliminaryChecks]);

  const onCredentialSelect = ({
    type: credentialType,
    issuerUrl,
    index,
    ...displayData
  }: CredentialCatalogAvailableItem & { index: number }) => {
    setLoadingIndex(index);
    dispatch(
      itwIssuanceChecks.request({
        displayData,
        issuerUrl,
        credentialType
      })
    );
  };

  /**
   * Renders a single credential catalog item in a FlatList.
   * @param catalogItem: the catalog item to render.
   */
  const CatalogItem = ({
    catalogItem,
    loading = false,
    index
  }: {
    catalogItem: CredentialCatalogItem;
    loading: boolean;
    index: number;
  }) => (
    <>
      <ListItemLoadingItw
        onPress={() =>
          !catalogItem.incoming && onCredentialSelect({ ...catalogItem, index })
        }
        accessibilityLabel={catalogItem.title}
        title={catalogItem.title}
        icon={catalogItem.icon}
        rightNode={
          catalogItem.incoming ? (
            <Badge
              text={I18n.t(
                "features.itWallet.issuing.credentialsCatalogScreen.incomingFeature"
              )}
              variant="success"
            />
          ) : (
            <Icon name="chevronRight" />
          )
        }
        disabled={catalogItem.incoming}
        loading={loading}
      />
    </>
  );

  return (
    <BaseScreenComponent goBack={true} contextualHelp={emptyContextualHelp}>
      <SafeAreaView style={{ ...IOStyles.flex }}>
        <View
          style={{ ...IOStyles.flex, ...IOStyles.horizontalContentPadding }}
        >
          <H2>
            {I18n.t("features.itWallet.issuing.credentialsCatalogScreen.title")}
          </H2>
          <View style={IOStyles.flex}>
            <VSpacer />
            <ItwSearchBar />
            <VSpacer />
            <FlatList
              data={CREDENTIALS_CATALOG}
              renderItem={({ item, index }) => (
                <CatalogItem
                  index={index}
                  catalogItem={item}
                  loading={index === loadingIndex}
                />
              )}
              keyExtractor={(item, index) => `${index}_${item.title}`}
              ItemSeparatorComponent={() => <VSpacer size={8} />}
            />
          </View>
        </View>
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default ItwCredentialsCatalogScreen;
