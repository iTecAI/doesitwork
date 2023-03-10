import { Box, Grid, IconButton, Paper, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import { ReactNode, useEffect } from "react";
import {
    MdChevronLeft,
    MdChevronRight,
    //MdQuestionAnswer,
    MdRefresh,
} from "react-icons/md";
import { useNavigate } from "react-router";
import { useLogin } from "../../util/LoginState";
import { CategoryPanel } from "./panels/CategoryPanel";
import { LocationPanel } from "./panels/LocationPanel";
import { UserPanel } from "./panels/UserPanel";
import "./settings.scss";

export function PanelWrapper(props: {
    children?: ReactNode | ReactNode[];
    text: string;
    icon: JSX.Element;
    refresh?: () => void;
}) {
    return (
        <Grid item xs={12} lg={4}>
            <Paper className="settings-panel">
                <Box className="panel-title">
                    <Box className="icon">{props.icon}</Box>
                    {props.refresh && (
                        <IconButton
                            className="refresh-btn"
                            onClick={props.refresh}
                        >
                            <MdRefresh />
                        </IconButton>
                    )}
                    <Box className="text">
                        <Stack spacing={1} direction="row">
                            <MdChevronLeft size={32} className="arrow" />
                            <Typography variant="overline" className="content">
                                {props.text}
                            </Typography>
                            <MdChevronRight size={32} className="arrow" />
                        </Stack>
                    </Box>
                </Box>
                <Box className="panel-content">{props.children}</Box>
            </Paper>
        </Grid>
    );
}

/*function RequestPanel() {
    return (
        <PanelWrapper
            text="Requests"
            icon={<MdQuestionAnswer size={24} />}
        ></PanelWrapper>
    );
}*/

export function SystemSettings() {
    const login = useLogin();
    const nav = useNavigate();

    useEffect(() => {
        if (!login.loggedIn && !window.localStorage.getItem("token")) {
            nav("/");
        }
    }, [login, nav]);

    return (
        <Grid container spacing={1} className="settings-grid">
            <CategoryPanel />
            <LocationPanel />
            <UserPanel />
        </Grid>
    );
}
