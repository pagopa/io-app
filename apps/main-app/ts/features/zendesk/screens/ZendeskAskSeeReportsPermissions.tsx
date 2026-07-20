import {
  ContentWrapper,
  Divider,
  IOButton,
  IOToast,
  IOVisualCostants,
  ListItemHeader,
  ListItemInfo,
  VSpacer
} from "@io-app/design-system";
import { useNavigation } from "@react-navigation/native";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import I18n from "i18next";
import { ComponentProps } from "react";
import { FlatList, ListRenderItemInfo, Platform } from "react-native";

import { IOScrollViewWithLargeHeader } from "../../../components/ui/IOScrollViewWithLargeHeader";
import { zendeskPrivacyUrl } from "../../../config";
import {
  AppParamsList,
  IOStackNavigationProp,
  IOStackNavigationRouteProps
} from "../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../store/hooks";
import { openWebUrl } from "../../../utils/url";
import {
  profileEmailSelector,
  profileFiscalCodeSelector,
  profileNameSurnameSelector
} from "../../settings/common/store/selectors";
import { ZendeskParamsList } from "../navigation/params";
import { type ZendeskAssistanceType } from "../store/actions";
import { ItemPermissionProps } from "./ZendeskAskPermissions";

export type ZendeskAskSeeReportsPermissionsNavigationParams = {
  assistanceType: ZendeskAssistanceType;
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
  const { assistanceType } = props.route.params;

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
  const items = permissionItems.filter(it => it.value != null);

  const renderPermissionItem = ({
    item
  }: ListRenderItemInfo<ItemPermissionProps>) => (
    <ListItemInfo
      icon={item.icon}
      label={item?.label}
      testID={item?.testID}
      value={item?.value}
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
          params: { assistanceType }
        });
      }
    }
  };

  return (
    <IOScrollViewWithLargeHeader
      actions={buttonConf}
      description={I18n.t("support.askPermissions.listBody")}
      ignoreSafeAreaMargin={Platform.OS === "ios"}
      testID={"ZendeskAskPermissions"}
      title={{
        label: I18n.t("support.askPermissions.title"),
        section: I18n.t("support.askPermissions.listTitle")
      }}
    >
      <ContentWrapper>
        <IOButton
          label={I18n.t("support.askPermissions.privacyLink")}
          onPress={() => {
            openWebUrl(zendeskPrivacyUrl, () =>
              IOToast.error(I18n.t("global.jserror.title"))
            );
          }}
          variant="link"
        />
      </ContentWrapper>

      <VSpacer size={16} />

      <FlatList
        contentContainerStyle={{
          paddingHorizontal: IOVisualCostants.appMarginDefault
        }}
        data={items}
        ItemSeparatorComponent={() => <Divider />}
        keyExtractor={(item, idx) => `permission_item_${item}_${idx}`}
        ListHeaderComponent={
          <ListItemHeader label={I18n.t("support.askPermissions.listHeader")} />
        }
        renderItem={renderPermissionItem}
        scrollEnabled={false}
      />
    </IOScrollViewWithLargeHeader>
  );
};

export default ZendeskAskSeeReportsPermissions;
