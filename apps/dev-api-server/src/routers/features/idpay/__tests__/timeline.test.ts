import supertest from "supertest";

import {
  initiatives as idPayInitiatives,
  initiativeTimeline
} from "../../../../persistence/idpay";
import app from "../../../../server";
import { addIdPayPrefix } from "../router";

const request = supertest(app);

const initiatives = Object.values(idPayInitiatives);

describe("IDPay Timeline API", () => {
  describe("GET getTimeline", () => {
    it("should return 200 with timeline list", async () => {
      const tInitiative = initiatives[0];
      const initiativeId = tInitiative.initiativeId;

      const response = await request.get(
        addIdPayPrefix(`/timeline/${initiativeId}`)
      );
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("operationList");
    });
    it("should return 200 with correct pagination info", async () => {
      const tInitiative = initiatives[0];
      const initiativeId = tInitiative.initiativeId;
      const timeline = initiativeTimeline[initiativeId] || [];

      const operationSize = timeline.length;

      const page = 1;
      const size = 4;

      const totalPages = Math.ceil(operationSize / size);

      const response = await request.get(
        addIdPayPrefix(`/timeline/${initiativeId}?page=${page}&size=${size}`)
      );
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("operationList");
      expect(response.body).toHaveProperty("pageNo", page);
      expect(response.body).toHaveProperty("pageSize", size);
      expect(response.body).toHaveProperty("totalPages", totalPages);
    });

    it("should return 404 if initiative ID does not exist", async () => {
      const initiativeId = "ABC123";

      const response = await request.get(
        addIdPayPrefix(`/timeline/${initiativeId}`)
      );
      expect(response.status).toBe(404);
    });
  });
  describe("GET getTimelineDetail", () => {
    it("should return 200 with operation details", async () => {
      const tInitiative = initiatives[0];
      const initiativeId = tInitiative.initiativeId;
      const timeline = initiativeTimeline[initiativeId] || [];

      const operationId = timeline[0].operationId;

      const response = await request.get(
        addIdPayPrefix(`/timeline/${initiativeId}/${operationId}`)
      );
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("operationId", operationId);
    });

    it("should return 404 if initiative ID does not exist", async () => {
      const initiativeId = "ABC123";
      const operationId = "A";

      const response = await request.get(
        addIdPayPrefix(`/timeline/${initiativeId}/${operationId}`)
      );
      expect(response.status).toBe(404);
    });
  });
});
