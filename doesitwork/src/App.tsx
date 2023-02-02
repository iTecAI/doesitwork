import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";

function App() {
    return (
        <ThemeProvider theme={createTheme({ palette: { mode: "dark" } })}>
            <CssBaseline />
        </ThemeProvider>
    );
}

export default App;
