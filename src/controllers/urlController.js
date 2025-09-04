const Url = require("../models/Url");
const shortid = require("shortid");
exports.createShortUrl = async (req, res) => {
  try {
    const { url, validity, shortcode } = req.body;

    const code = shortcode || shortid.generate();
    const expiryDate = validity ? new Date(Date.now() + validity * 60000) : null;

    const newUrl = new Url({
      originalUrl: url,
      shortCode: code,
      expiry: expiryDate,
    });

    await newUrl.save();

    res.json({
      shortLink: `http://localhost:4000/${code}`,
      expiry: expiryDate,
      originalUrl: url,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to create short URL" });
  }
};
exports.redirectUrl = async (req, res) => {
  try {
    const code = req.params.code;
    const urlDoc = await Url.findOne({ shortCode: code });

    if (!urlDoc) return res.status(404).json({ message: "Not found" });
    if (urlDoc.expiry && urlDoc.expiry < new Date())
      return res.status(410).json({ message: "Link expired" });
    urlDoc.clicks.push({
      ip: req.ip,
      referrer: req.headers.referer || "",
    });
    await urlDoc.save();

    res.redirect(urlDoc.originalUrl);
  } catch (err) {
    res.status(500).json({ message: "Redirect failed" });
  }
};
exports.getStats = async (req, res) => {
  try {
    const code = req.params.code;
    const urlDoc = await Url.findOne({ shortCode: code });

    if (!urlDoc) return res.status(404).json({ message: "Not found" });

    res.json({
      originalUrl: urlDoc.originalUrl,
      shortLink: `http://localhost:4000/${code}`,
      createdAt: urlDoc.createdAt,
      expiry: urlDoc.expiry,
      totalClicks: urlDoc.clicks.length,
      clicks: urlDoc.clicks,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};
