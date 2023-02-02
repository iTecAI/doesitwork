import { Box, Grid, Paper, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import { ReactNode, useEffect } from "react";
import {
    MdAccountCircle,
    MdCategory,
    MdChevronLeft,
    MdChevronRight,
    MdLocationPin,
    MdQuestionAnswer,
} from "react-icons/md";
import { useNavigate } from "react-router";
import { useLogin } from "../../util/LoginState";
import "./settings.scss";

function PanelTitle(props: { text: string; icon: JSX.Element }) {
    return (
        <Box className="panel-title">
            <Box className="icon">{props.icon}</Box>
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
    );
}

function PanelWrapper(props: {
    children?: ReactNode | ReactNode[];
    text: string;
    icon: JSX.Element;
}) {
    return (
        <Grid item xs={12} lg={3}>
            <Paper className="settings-panel">
                <PanelTitle text={props.text} icon={props.icon} />
                <Box className="panel-content">{props.children}</Box>
            </Paper>
        </Grid>
    );
}

function CategoryPanel() {
    return (
        <PanelWrapper
            text="Categories"
            icon={<MdCategory size={24} />}
        ></PanelWrapper>
    );
}

function LocationPanel() {
    return (
        <PanelWrapper
            text="Locations"
            icon={<MdLocationPin size={24} />}
        ></PanelWrapper>
    );
}

function RequestPanel() {
    return (
        <PanelWrapper
            text="Requests"
            icon={<MdQuestionAnswer size={24} />}
        ></PanelWrapper>
    );
}

function UserPanel() {
    return (
        <PanelWrapper
            text="Users"
            icon={<MdAccountCircle size={24} />}
        ></PanelWrapper>
    );
}

export function SystemSettings() {
    const login = useLogin();
    const nav = useNavigate();

    useEffect(() => {
        if (!login.loggedIn) {
            nav("/");
        }
    }, [login, nav]);

    return (
        <Grid container spacing={1} className="settings-grid">
            <CategoryPanel />
            <LocationPanel />
            <RequestPanel />
            <UserPanel />
        </Grid>
    );
}
