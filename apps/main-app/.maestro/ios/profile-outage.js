const url = "http://127.0.0.1:3000/maestro/profile-outage";
const result =
  ENABLE === "yes" ? http.post(url, { body: "{}" }) : http.delete(url);
if (result.status !== 204) {
  throw new Error(
    "Cannot configure profile outage; start the dev API with MAESTRO_FIXTURES=1. HTTP " +
      result.status
  );
}
