import express from "express";
import cors from "cors";
import Joi from "joi";
import requestIp from "request-ip";
import geoip from "geoip-lite";
import mongoose from "mongoose";

import connectDB from "./config/db.js";
import Url from "./models/Url.js";
import { requestLogger, errorLogger } from "./middleware/logger.js";
import { generateCode, isValidShortcode } from "./utils/shortcode.js";

const app = express();
const PORT = process.env.PORT || 4000;

connectDB();

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(requestLogger);

function baseUrlFromReq(req) {
  const proto = req.protocol;
  const host = req.get("host");
  return `${proto}://${host}`;
}

function nowIso() {
  return new Date().toISOString();
}

function minutesFromNow(mins) {
  return new Date(Date.now() + mins * 60 * 1000).toISOString();
}

function validateBody(body) {
  const schema = Joi.object({
    url: Joi.string().uri({ scheme: [/https?/] }).required(),
    validity: Joi.number().integer().min(1).optional(), // minutes
    shortcode: Joi.string().alphanum().min(4).max(12).optional(),
  });
  return schema.validate(body, { abortEarly: false });
}

app.post("/shorturls", async (req, res) => {
  const { error, value } = validateBody(req.body || {});
  if (error) {
    return res.status(400).json({
      error: "BadRequest",
      message: "Invalid request body",
      details: error.details.map((d) => d.message),
    });
  }

  const { url, validity, shortcode } = value;
  const ttlMins = validity ?? 30;

  let code;
  if (shortcode) {
    if (!isValidShortcode(shortcode)) {
      return res.status(422).json({
        error: "InvalidShortcode",
        message: "Shortcode must be 4-12 alphanumeric characters.",
      });
    }
    const existing = await Url.findOne({ shortcode });
    if (existing) {
      return res.status(409).json({
        error: "ShortcodeTaken",
        message: "The requested shortcode is already in use.",
      });
    }
    code = shortcode;
  } else {
    do {
      code = generateCode(6);
    } while (await Url.findOne({ shortcode: code }));
  }

  const createdAt = nowIso();
  const expiresAt = minutesFromNow(ttlMins);
  const shortLink = `${baseUrlFromReq(req)}/${code}`;

  const newUrl = new Url({
    shortcode: code,
    originalUrl: url,
    createdAt,
    expiresAt,
    shortLink,
    clicks: [],
    totalClicks: 0,
  });
  await newUrl.save();
  return res.status(201).json({ shortLink, expiry: expiresAt });
});
app.get("/shorturls/:code", async (req, res) => {
  const code = req.params.code;
  const entry = await Url.findOne({ shortcode: code });
  if (!entry) {
    return res
      .status(404)
      .json({ error: "NotFound", message: "Shortcode does not exist." });
  }
  return res.json({
    shortcode: entry.shortcode,
    shortLink: entry.shortLink,
    originalUrl: entry.originalUrl,
    createdAt: entry.createdAt,
    expiry: entry.expiresAt,
    totalClicks: entry.totalClicks,
    clicks: entry.clicks.map((c) => ({
      timestamp: c.timestamp,
      referrer: c.referrer,
      userAgent: c.userAgent,
      ip: c.ip,
      country: c.country,
      region: c.region,
      city: c.city,
    })),
  });
});
app.get("/:code", async (req, res) => {
  const code = req.params.code;
  const entry = await Url.findOne({ shortcode: code });
  if (!entry) {
    return res
      .status(404)
      .json({ error: "NotFound", message: "Shortcode does not exist." });
  }
  const now = Date.now();
  const exp = Date.parse(entry.expiresAt);
  if (isNaN(exp) || now > exp) {
    return res
      .status(410)
      .json({ error: "LinkExpired", message: "This short link has expired." });
  }
  const ip = requestIp.getClientIp(req) || "";
  const referrer = req.get("referer") || null;
  const ua = req.get("user-agent") || null;
  const geo = ip ? geoip.lookup(ip) || {} : {};
  const click = {
    timestamp: nowIso(),
    referrer,
    userAgent: ua,
    ip,
    country: geo.country || null,
    region: geo.region || geo.state || null,
    city: geo.city || null,
  };

  entry.totalClicks = (entry.totalClicks || 0) + 1;
  entry.clicks.push(click);
  await entry.save();

  return res.redirect(302, entry.originalUrl);
});

app.use(errorLogger);
app.use((err, req, res, next) => {
  const status = err.status || 500;
  return res
    .status(status)
    .json({ error: "ServerError", message: "Something went wrong." });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
