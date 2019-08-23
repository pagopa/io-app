"use strict";
exports.__esModule = true;
var request = require("supertest");
var express = require("express");
var app = express();
app.get("/user", function (_, res) {
    res.status(200).json({ name: "john" });
});
describe("GET /user", function () {
    it("responds with json", function (done) {
        request(app)
            .get("/user")
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200, done);
    });
});
