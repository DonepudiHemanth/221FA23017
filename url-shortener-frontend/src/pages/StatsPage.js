import React, { useState } from "react";
import {
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Box,
} from "@mui/material";
import { getStats } from "../api";

function StatsPage() {
  const [code, setCode] = useState("");
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  const handleFetch = async () => {
    try {
      const res = await getStats(code);
      setStats(res);
      setError("");
    } catch (e) {
      setStats(null);
      setError(e.response?.data?.message || "Not found");
    }
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
          maxWidth: 800,
          width: "100%",
          p: 4,
          textAlign: "center",
        }}
      >
        <Typography variant="h3" gutterBottom fontWeight="bold">
          URL Statistics
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <TextField
            label="Enter Shortcode"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            sx={{ mr: 2, width: "60%" }}
          />
          <Button variant="contained" onClick={handleFetch}>
            Fetch Stats
          </Button>
        </Box>

        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}

        {stats && (
          <Card sx={{ mt: 3, p: 2, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6">Original: {stats.originalUrl}</Typography>
              <Typography>Short Link: {stats.shortLink}</Typography>
              <Typography>Created: {stats.createdAt}</Typography>
              <Typography>Expiry: {stats.expiry}</Typography>
              <Typography>Total Clicks: {stats.totalClicks}</Typography>

              <Typography variant="h6" sx={{ mt: 2 }}>
                Click Logs
              </Typography>
              {stats.clicks.map((c, i) => (
                <Typography key={i} variant="body2" color="text.secondary">
                  {c.timestamp} | {c.ip} | {c.country} {c.city} | {c.referrer}
                </Typography>
              ))}
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
}

export default StatsPage;
    