import React, { useState } from "react";
import {
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Box,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { createShortUrl } from "../api";

function ShortenerPage() {
  const [urls, setUrls] = useState([{ url: "", validity: 30, shortcode: "" }]);
  const [results, setResults] = useState([]);

  const handleChange = (i, field, value) => {
    const updated = [...urls];
    updated[i][field] = value;
    setUrls(updated);
  };

  const addRow = () => {
    if (urls.length < 5)
      setUrls([...urls, { url: "", validity: 30, shortcode: "" }]);
  };

  const handleSubmit = async () => {
    const out = [];
    for (const u of urls) {
      if (!u.url) continue;
      try {
        const res = await createShortUrl({
          url: u.url,
          validity: u.validity,
          shortcode: u.shortcode || undefined,
        });
        out.push({ ...u, ...res });
      } catch (e) {
        out.push({ ...u, error: e.response?.data?.message || "Failed" });
      }
    }
    setResults(out);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <Box
      sx={{
        minHeight: "50vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        
        p: 3,
      }}
    >
      <Box
        sx={{
          maxWidth: 900,
          width: "100%", 
          p: 4,
          textAlign: "center",
        }}
      >
        <Typography variant="h3" gutterBottom fontWeight="bold">
          Shorten Your URLs
        </Typography>

        {urls.map((u, i) => (
          <Grid
            container
            spacing={2}
            key={i}
            sx={{ mb: 2, justifyContent: "center" }}
          >
            <Grid item xs={12} md={6}>
              <TextField
                label="Long URL"
                fullWidth
                value={u.url}
                onChange={(e) => handleChange(i, "url", e.target.value)}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField
                label="Validity (mins)"
                type="number"
                fullWidth
                value={u.validity}
                onChange={(e) => handleChange(i, "validity", e.target.value)}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField
                label="Custom Shortcode"
                fullWidth
                value={u.shortcode}
                onChange={(e) => handleChange(i, "shortcode", e.target.value)}
              />
            </Grid>
          </Grid>
        ))}

        <Box sx={{ mb: 3 }}>
          <Button variant="outlined" onClick={addRow} sx={{ mr: 2 }}>
            + Add URL
          </Button>
          <Button variant="contained" onClick={handleSubmit}>
            Shorten
          </Button>
        </Box>

        {results.map((r, i) => (
          <Card sx={{ mt: 3, p: 2, boxShadow: 3 }} key={i}>
            <CardContent>
              <Typography variant="body1">Original: {r.url}</Typography>
              {r.error ? (
                <Typography color="error">Error: {r.error}</Typography>
              ) : (
                <>
                  <Typography variant="body1">
                    Shortened:{" "}
                    <a href={r.shortLink} target="_blank" rel="noreferrer">
                      {r.shortLink}
                    </a>
                    <IconButton
                      size="small"
                      onClick={() => copyToClipboard(r.shortLink)}
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Expiry: {r.expiry}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}

export default ShortenerPage;
