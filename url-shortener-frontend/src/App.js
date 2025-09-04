import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, CssBaseline, ThemeProvider, createTheme, Container } from "@mui/material";
import ShortenerPage from "./pages/ShortenerPage";
import StatsPage from "./pages/StatsPage";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2", // blue
    },
    secondary: {
      main: "#ff4081", // pink
    },
  },
  shape: {
    borderRadius: 16,
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppBar position="sticky" color="primary" elevation={3}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }}>
              🚀 URL Shortener
            </Typography>
            <Button color="inherit" component={Link} to="/">
              Shorten
            </Button>
            <Button color="inherit" component={Link} to="/stats">
              Stats
            </Button>
          </Toolbar>
        </AppBar>

        <Container sx={{ mt: 5 }}>
          <Routes>
            <Route path="/" element={<ShortenerPage />} />
            <Route path="/stats" element={<StatsPage />} />
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  );
}

export default App;
