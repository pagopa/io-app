const serviceId = "service1";
const response = http.get(
  "http://127.0.0.1:3000/api/catalog/v1/services/" + serviceId
);
if (response.status !== 200) {
  throw new Error("Cannot load service link fixture: HTTP " + response.status);
}
const service = json(response.body);
if (service.id !== serviceId || !service.name) {
  throw new Error("Unexpected service link fixture");
}
output.serviceLink = "ioit://services/service-detail?serviceId=" + serviceId;
output.serviceName = service.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
