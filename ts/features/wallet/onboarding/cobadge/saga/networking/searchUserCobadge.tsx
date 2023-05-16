import * as E from "fp-ts/lib/Either";
import { CobadgeResponse } from "../../../../../../../definitions/pagopa/walletv2/CobadgeResponse";
import { PaymentManagerClient } from "../../../../../../api/pagopa";
import { mixpanelTrack } from "../../../../../../mixpanel";
import { PaymentManagerToken } from "../../../../../../types/pagopa";
import {
  getGenericError,
  getNetworkError,
  NetworkError
} from "../../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../../utils/reporters";
import { SessionManager } from "../../../../../../utils/SessionManager";
import { trackCobadgeResponse } from "../../analytics";

type CoBadgeRequestQuery = {
  abiCode?: string;
  panCode?: string;
};

const cobadgePrefix = "WALLET_ONBOARDING_COBADGE_SEARCH";

const withTokenSuffix = "WITH_TOKEN";
const withoutTokenSuffix = "WITHOUT_TOKEN";

/**
 * This method contains the generic networking logic used to request a user's cobadge and privative
 * cards. The request for privative cards also requires the pancode
 * @param cobadgeQuery  the input data to search the privative / cobadge
 * @param getCobadgePans the http client for /cobadge/pans
 * @param searchCobadgePans the http client for /cobadge/search
 * @param sessionManager
 * @param searchRequestId the searchRequestToken that should be used if defined
 */
export const searchUserCobadge = async (
  cobadgeQuery: CoBadgeRequestQuery,
  getCobadgePans: ReturnType<typeof PaymentManagerClient>["getCobadgePans"],
  searchCobadgePans: ReturnType<
    typeof PaymentManagerClient
  >["searchCobadgePans"],
  sessionManager: SessionManager<PaymentManagerToken>,
  searchRequestId: string | undefined
): Promise<E.Either<NetworkError, CobadgeResponse>> => {
  const logPrefix = `${cobadgeQuery.panCode ? undefined : cobadgePrefix}_${
    searchRequestId ? withTokenSuffix : withoutTokenSuffix
  }`;

  try {
    void mixpanelTrack(`${logPrefix}_REQUEST`, {
      abi: cobadgeQuery.abiCode ?? "all"
    });

    const getPansWithRefreshResult = await sessionManager.withRefresh(
      searchRequestId
        ? searchCobadgePans(searchRequestId)
        : getCobadgePans(cobadgeQuery.abiCode, cobadgeQuery.panCode)
    )();
    if (E.isRight(getPansWithRefreshResult)) {
      if (getPansWithRefreshResult.right.status === 200) {
        if (getPansWithRefreshResult.right.value.data) {
          void mixpanelTrack(
            `${logPrefix}_SUCCESS`,
            trackCobadgeResponse(getPansWithRefreshResult.right.value.data)
          );
          return E.right(getPansWithRefreshResult.right.value.data);
        } else {
          // it should not never happen
          const error = getGenericError(new Error(`data is undefined`));
          void mixpanelTrack(`${logPrefix}_FAILURE`, { reason: error });
          return E.left(error);
        }
      } else {
        const error = getGenericError(
          new Error(`response status ${getPansWithRefreshResult.right.status}`)
        );
        void mixpanelTrack(`${logPrefix}_FAILURE`, { reason: error });
        return E.left(error);
      }
    } else {
      const error = getGenericError(
        new Error(readablePrivacyReport(getPansWithRefreshResult.left))
      );
      void mixpanelTrack(`${logPrefix}_FAILURE`, { reason: error });
      return E.left(error);
    }
  } catch (e) {
    const error = getNetworkError(e);
    void mixpanelTrack(`${logPrefix}_FAILURE`, { reason: error });
    return E.left(error);
  }
};
