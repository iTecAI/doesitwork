import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { useEffect, useState } from "react";
import { get } from "./util/api";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./pages/layout/Layout";

function App() {
    const [organization, setOrganization] = useState<string>(
        window.localStorage.getItem("cacheOrgName") ?? ""
    );
    const [organizationColor, setOrganizationColor] = useState<string>(
        window.localStorage.getItem("cacheOrgColor") ?? "#6b4493"
    );

    useEffect(() => {
        get<{ brand: string | null; name: string | null }>("/theming").then(
            (result) => {
                if (result.success) {
                    if (result.data.brand) {
                        setOrganizationColor(result.data.brand);
                        window.localStorage.setItem(
                            "cacheOrgColor",
                            result.data.brand
                        );
                    }
                    if (result.data.name) {
                        setOrganization(result.data.name);
                        window.localStorage.setItem(
                            "cacheOrgName",
                            result.data.name
                        );
                    }
                }
            }
        );
    }, []);

    return (
        <ThemeProvider
            theme={createTheme({
                palette: { mode: "dark", primary: { main: organizationColor } },
            })}
        >
            <CssBaseline />
            <BrowserRouter>
                <Routes>
                    <Route
                        path="/"
                        element={<Layout organization={organization} />}
                    ></Route>
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;
