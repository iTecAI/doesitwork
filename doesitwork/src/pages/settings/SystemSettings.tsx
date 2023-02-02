import { Box, Grid, IconButton, Paper, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import { ReactNode, useEffect, useState } from "react";
import {
    MdAccountCircle,
    MdCategory,
    MdChevronLeft,
    MdChevronRight,
    MdDelete,
    MdLocationPin,
    MdQuestionAnswer,
    MdRefresh,
} from "react-icons/md";
import { useNavigate } from "react-router";
import { AdminUser } from "../../types";
import { get } from "../../util/api";
import { useLogin } from "../../util/LoginState";
import "./settings.scss";

function PanelWrapper(props: {
    children?: ReactNode | ReactNode[];
    text: string;
    icon: JSX.Element;
    refresh?: () => void;
}) {
    return (
        <Grid item xs={12} lg={3}>
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
    const login = useLogin();
    const [users, setUsers] = useState<AdminUser[]>([]);

    function refresh() {
        get<AdminUser[]>("/admin/all").then((result) => {
            if (result.success) {
                setUsers(result.data);
            }
        });
    }

    useEffect(refresh, [login]);

    return (
        <PanelWrapper
            text="Users"
            icon={<MdAccountCircle size={24} />}
            refresh={refresh}
        >
            {users.map((v) => (
                <Paper className="user-item" key={v.user_id} elevation={4}>
                    <Typography variant="body1" className="username">
                        {v.name}
                    </Typography>
                    <Typography variant="body2" className="email">
                        {v.email}
                    </Typography>
                    {login.loggedIn && v.user_id !== login.user.user_id && (
                        <IconButton className="delete" color="error">
                            <MdDelete />
                        </IconButton>
                    )}
                </Paper>
            ))}
        </PanelWrapper>
    );
}

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
            <RequestPanel />
            <UserPanel />
        </Grid>
    );
}
