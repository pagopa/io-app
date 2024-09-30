import {
  ButtonLink,
  ContentWrapper,
  Divider,
  IOToast,
  IOVisualCostants,
  ListItemHeader,
  ListItemInfo,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React, { ComponentProps } from "react";
import { FlatList, ListRenderItemInfo } from "react-native";
import { IOScrollViewWithLargeHeader } from "../../../components/ui/IOScrollViewWithLargeHeader";
import { zendeskPrivacyUrl } from "../../../config";
import I18n from "../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp,
  IOStackNavigationRouteProps
} from "../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../store/hooks";
import {
  profileEmailSelector,
  profileFiscalCodeSelector,
  profileNameSurnameSelector
} from "../../../store/reducers/profile";
import { openWebUrl } from "../../../utils/url";
import { ZendeskParamsList } from "../navigation/params";
import { ItemPermissionProps } from "./ZendeskAskPermissions";

export type ZendeskAskSeeReportsPermissionsNavigationParams = {
  assistanceForPayment: boolean;
  assistanceForCard: boolean;
  assistanceForFci: boolean;
};

type Props = IOStackNavigationRouteProps<
  ZendeskParamsList,
  "ZENDESK_ASK_SEE_REPORTS_PERMISSIONS"
>;

/**
 * this screen shows the kinds of data the app could collect when a user is looking at the previous ticket only for the authenticated users
 * @constructor
 */
const ZendeskAskSeeReportsPermissions = (props: Props) => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const { assistanceForPayment, assistanceForCard, assistanceForFci } =
    props.route.params;

  /* Get user's profile data */
  const fiscalCode = useIOSelector(profileFiscalCodeSelector);
  const nameSurname = useIOSelector(profileNameSurnameSelector);
  const email = pipe(
    useIOSelector(profileEmailSelector),
    O.fold(
      () => undefined,
      e => e
    )
  );

  const permissionItems: ReadonlyArray<ItemPermissionProps> = [
    {
      id: "profileNameSurname",
      icon: "profile",
      label: I18n.t("support.askPermissions.nameSurname"),
      value: nameSurname,
      testID: "profileNameSurname"
    },
    {
      id: "profileFiscalCode",
      icon: "fiscalCodeIndividual",
      label: I18n.t("support.askPermissions.fiscalCode"),
      value: fiscalCode,
      testID: "profileFiscalCode"
    },
    {
      id: "profileEmail",
      icon: "email",
      label: I18n.t("support.askPermissions.emailAddress"),
      value: email,
      testID: "profileEmail"
    }
  ];

  /* Remove items that have no value associated with them */
  const items = permissionItems.filter(it => it.value);

  const renderPermissionItem = ({
    item
  }: ListRenderItemInfo<ItemPermissionProps>) => (
    <ListItemInfo
      testID={item?.testID}
      label={item?.label}
      value={item?.value}
      icon={item.icon}
    />
  );

  const buttonConf: ComponentProps<
    typeof IOScrollViewWithLargeHeader
  >["actions"] = {
    type: "SingleButton",
    primary: {
      label: I18n.t("support.askPermissions.cta.allow"),
      testID: "continueButtonId",
      onPress: () => {
        navigation.navigate("ZENDESK_MAIN", {
          screen: "ZENDESK_SEE_REPORTS_ROUTERS",
          params: {
            assistanceForPayment,
            assistanceForCard,
            assistanceForFci
          }
        });
      }
    }
  };

  return (
    <IOScrollViewWithLargeHeader
      title={{
        label: I18n.t("support.askPermissions.title"),
        section: I18n.t("support.askPermissions.listTitle")
      }}
      testID={"ZendeskAskPermissions"}
      description={I18n.t("support.askPermissions.listBody")}
      actions={buttonConf}
      ignoreSafeAreaMargin={true}
    >
      <ContentWrapper>
        <ButtonLink
          label={I18n.t("support.askPermissions.privacyLink")}
          onPress={() => {
            openWebUrl(zendeskPrivacyUrl, () =>
              IOToast.error(I18n.t("global.jserror.title"))
            );
          }}
        />
      </ContentWrapper>

      <VSpacer size={16} />

      <FlatList
        scrollEnabled={false}
        contentContainerStyle={{
          paddingHorizontal: IOVisualCostants.appMarginDefault
        }}
        ListHeaderComponent={
          <ListItemHeader label={I18n.t("support.askPermissions.listHeader")} />
        }
        data={items}
        keyExtractor={(item, idx) => `permission_item_${item}_${idx}`}
        renderItem={renderPermissionItem}
        ItemSeparatorComponent={() => <Divider />}
      />
    </IOScrollViewWithLargeHeader>
  );
};

export default ZendeskAskSeeReportsPermissions;
