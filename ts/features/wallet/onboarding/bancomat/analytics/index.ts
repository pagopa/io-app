import { getType } from "typesafe-actions";
import { mixpanel } from "../../../../../mixpanel";
import { Action } from "../../../../../store/actions/types";
import {
  addBancomatToWallet,
  loadAbi,
  searchUserPans,
  walletAddBancomatBack,
  walletAddBancomatCancel,
  walletAddBancomatCompleted,
  walletAddBancomatFailure,
  walletAddBancomatStart
} from "../store/actions";
import { getNetworkErrorMessage } from "../../../../../utils/errors";

const trackAction =
  (mp: NonNullable<typeof mixpanel>) =>
  (action: Action): Promise<void> => {
    switch (action.type) {
      case getType(walletAddBancomatStart):
      case getType(walletAddBancomatCompleted):
      case getType(walletAddBancomatCancel):
      case getType(walletAddBancomatBack):
      case getType(loadAbi.request):
      case getType(addBancomatToWallet.request):
      case getType(addBancomatToWallet.success):
        return mp.track(action.type);

      case getType(loadAbi.success):
        return mp.track(action.type, {
          count: action.payload.data?.length
        });
      case getType(searchUserPans.request):
        return mp.track(action.type, { abi: action.payload ?? "all" });
      case getType(searchUserPans.success):
        const messages = action.payload.messages.reduce(
          (acc, val) => {
            if (
              val.caName !== undefined &&
              val.cardsNumber !== undefined &&
              val.code !== undefined
            ) {
              return {
                ...acc,
                [`${val.caName}cardsNumber`]: val.cardsNumber,
                [`${val.caName}code`]: val.code
              };
            }
            return acc;
          },
          {
            caNames: action.payload.messages.map(m => m.caName?.toString())
          } as {
            [key: string]: string | number | ReadonlyArray<string>;
          }
        );
        return mp.track(action.type, {
          count: action.payload.cards.length,
          ...messages
        });

      case getType(loadAbi.failure):
      case getType(addBancomatToWallet.failure):
        return mp.track(action.type, { reason: action.payload.message });

      case getType(searchUserPans.failure):
        return mp.track(action.type, {
          reason: getNetworkErrorMessage(action.payload)
        });
      case getType(walletAddBancomatFailure):
        return mp.track(action.type, {
          reason: action.payload
        });
    }
    return Promise.resolve();
  };

export default trackAction;
