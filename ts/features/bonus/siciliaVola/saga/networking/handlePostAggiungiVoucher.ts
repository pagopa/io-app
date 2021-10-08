import { ActionType } from "typesafe-actions";
import { delay, Effect, put } from "redux-saga/effects";
import { SessionManager } from "../../../../../utils/SessionManager";
import { MitVoucherToken } from "../../../../../../definitions/io_sicilia_vola_token/MitVoucherToken";
import { svGenerateVoucherGeneratedVoucher } from "../../store/actions/voucherGeneration";
import { SvVoucherGeneratedResponse } from "../../types/SvVoucherResponse";
import { SvVoucher } from "../../types/SvVoucher";

/**
 * Handle the remote call to check if the service is alive
 * @param __
 * @param _
 */
// TODO: add client as parameter when the client will be created
export function* handlePostAggiungiVoucher(
  __: SessionManager<MitVoucherToken>,
  _: ActionType<typeof svGenerateVoucherGeneratedVoucher.request>
): Generator<Effect, void> {
  // TODO: add networking logic
  yield delay(500);
  const stubVoucher = {
    id: 123456,
    beneficiary: "Mario Rossi",
    category: "student",
    university: {
      universityName: "Università Cattolica",
      municipality: { id: "1", name: "Milano" }
    },
    departureDate: new Date(),
    availableDestination: [
      "Catania - Fontanarossa",
      "Palermo - Falcone e Borsellino",
      "Milano - Malpensa",
      "Bergamo - Orio al serio"
    ] as ReadonlyArray<string>,
    qrCode:
      "iVBORw0KGgoAAAANSUhEUgAAAPoAAAD6AQAAAACgl2eQAAAAz0lEQVR42u3YQQ6EIAwF0N68PdrcjMHSFtRoJrPkf4wG5K0aaUFp7+0jBAQEBAQ/ABNv2nvarxrBAR3PvOY7NNCDMyZ7fHKECypc4MCXDDSYbI4AQaTOSCDPmXZzkG0E56Xybg7M14kn0SNcfisqOIi2WVkBwSwkPlkdSOA59Py5oAGT8TY2WuK7LUCwfjTtFCksUIW1nnqPJALIrZV3MqciguUAErFCBpb7jGbXHxRQICuKPJ9YNwfFlmICCCqRxnn0tnAwAP9XExAQEPwNvr/Ly7QrJMNyAAAAAElFTkSuQmCC",
    barCode:
      "iVBORw0KGgoAAAANSUhEUgAAAJYAAABQAQAAAADTy7HmAAAALElEQVR42mP4/zO/UMX1WWdJn15k9c6qdJH/fxhGxUbFRsVGxUbFRsUIiAEAxCE9PtkFIH0AAAAASUVORK5CYII="
  } as SvVoucher;
  yield put(
    svGenerateVoucherGeneratedVoucher.success({
      kind: "success",
      value: stubVoucher
    } as SvVoucherGeneratedResponse)
  );
}
