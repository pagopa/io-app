const response = http.post("http://127.0.0.1:3000/maestro/expire-session", {
  body: "{}",
  headers: { "Content-Type": "application/json" }
});
if (response.status !== 204) {
  throw new Error("Cannot expire the mock session: HTTP " + response.status);
}
