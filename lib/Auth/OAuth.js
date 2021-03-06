/* eslint-disable new-cap */
/* eslint-disable camelcase */
"use strict";

const open = require("open");
const express = require("express");
const fs = require("fs");

const { google } = require("googleapis");

var auth;

function OAuth(options) {
  const { envPath } = options;
  const json = fs.readFileSync(envPath);
  const keys = JSON.parse(json);

  auth = new google.auth.OAuth2(
    keys.web.client_id,
    keys.web.client_secret,
    keys.web.redirect_uris[0]
  );
}

OAuth.prototype.init = function(config) {
  const { scopes, access_type = "offline" } = config;
  const app = express();

  const authUrl = auth.generateAuthUrl({
    access_type: access_type,
    scope: scopes
  });

  const server = app.listen(3000, () => {
    open(authUrl, { wait: false });
  });

  return new Promise(resolve => {
    app.get("/oauth2callback", async (req, res) => {
      try {
        const code = req.query.code;

        const token = await auth.getToken(code);

        auth.credentials = token;
        res.send("Success");
        server.close();

        resolve(auth);
      } catch (e) {
        console.log(e);
      }
    });
  });
};

OAuth.prototype.moduleName = function() {
  return "OAuth";
};

module.exports = OAuth;
