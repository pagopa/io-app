import * as E from "fp-ts/lib/Either";
import * as t from "io-ts";
import { Alert } from "react-native";
import I18n from "i18next";
/*
    Contains utility functions to check conditions
    used across project (currently just in CardComponent)
 */

// TODO: unify card representation (multiple part of the application use this)
export const FOUR_UNICODE_CIRCLES = "●".repeat(4);

/**
 * it sanitizes psp tags avoiding no string value and string duplicates
 * @param w wallet object
 */
export const fixWalletPspTagsValues = (w: unknown) => {
  const decoder = t.interface({
    psp: t.interface({
      tags: t.readonlyArray(t.unknown)
    })
  });
  const decoded = decoder.decode(w);
  if (E.isLeft(decoded)) {
    return w;
  }
  const psp = decoded.right.psp;
  const tags = decoded.right.psp.tags;
  return {
    ...decoded.right,
    psp: {
      ...psp,
      tags: tags.filter(
        (item: any, idx: number) =>
          typeof item === "string" && tags.indexOf(item) === idx
      )
    }
  };
};

/**
 * This function handles the set favourite method on wallet section:
 * - if it is already a favourite it displays an alert suggesting to select another favourite method
 * - if it is not a favourite the callback will be executed
 * more information at https://www.pivotaltracker.com/story/show/172762258
 * @param willBeFavorite defines if the method will be the favourite selected by the user
 * @param callback method to invoke for saving the method
 */
export const handleSetFavourite = (
  willBeFavorite: boolean,
  callback: () => void
) =>
  willBeFavorite
    ? callback()
    : Alert.alert(
        I18n.t("global.genericAlert"),
        I18n.t("wallet.alert.favorite")
      );
