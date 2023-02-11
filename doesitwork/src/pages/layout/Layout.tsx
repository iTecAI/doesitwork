import {
    Alert,
    AppBar,
    Box,
    Button,
    Chip,
    Divider,
    IconButton,
    InputAdornment,
    ListItem,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Paper,
    Popover,
    TextField,
    Typography,
} from "@mui/material";
import { Stack } from "@mui/system";
import { Outlet, useNavigate } from "react-router";
import "./layout.scss";
import {
    MdAdminPanelSettings,
    MdLogin,
    MdLogout,
    MdManageAccounts,
    MdPassword,
    MdPerson,
    MdSettings,
    MdStar,
} from "react-icons/md";
import { useState } from "react";
import { useLogin } from "../../util/LoginState";
import { AccountSettingsDialog } from "./AccountSettings";

function AdminMenuItem(props: {
    text: string;
    icon: JSX.Element;
    setAnchor: (anchor: null | HTMLElement) => void;
    event?: () => void;
}) {
    return (
        <MenuItem
            onClick={() => {
                props.setAnchor(null);
                if (props.event) {
                    props.event();
                }
            }}
        >
            <ListItemIcon>{props.icon}</ListItemIcon>
            <ListItemText>{props.text}</ListItemText>
        </MenuItem>
    );
}

export function Layout(props: { organization: string }) {
    const [loginAnchor, setLoginAnchor] = useState<null | HTMLElement>(null);
    const loginState = useLogin();

    const [loginUsername, setLoginUsername] = useState<string>("");
    const [loginPassword, setLoginPassword] = useState<string>("");
    const [loginError, setLoginError] = useState<boolean>(false);

    const [adminAnchor, setAdminAnchor] = useState<null | HTMLElement>(null);

    const [dialogAccount, setDialogAccount] = useState<boolean>(false);

    const nav = useNavigate();

    return (
        <Box className="layout-root">
            <AppBar className="navbar">
                <Stack direction="row" spacing={1}>
                    <img
                        src="/icon.svg"
                        className="icon"
                        alt="Application icon"
                    />
                    <Typography
                        variant="h5"
                        className="title"
                        onClick={() => nav("/")}
                    >
                        DoesItWork
                        {props.organization ? ` @ ${props.organization}` : ""}
                    </Typography>
                </Stack>
                {loginState.loggedIn && (
                    <IconButton
                        className="admin-menu"
                        onClick={(event) => setAdminAnchor(event.currentTarget)}
                    >
                        <MdAdminPanelSettings />
                    </IconButton>
                )}
                <Menu
                    className="admin-menu-panel"
                    open={Boolean(adminAnchor)}
                    anchorEl={adminAnchor}
                    onClose={() => setAdminAnchor(null)}
                >
                    <ListItem>
                        <ListItemText>
                            User:{" "}
                            <Chip
                                sx={{
                                    marginLeft: "8px",
                                    transform: "translate(0, -1px)",
                                }}
                                size="small"
                                variant="outlined"
                                label={
                                    loginState.loggedIn
                                        ? loginState.user.name
                                        : "NaN"
                                }
                            />
                        </ListItemText>
                    </ListItem>
                    <Divider />
                    <AdminMenuItem
                        text="Account Settings"
                        icon={<MdManageAccounts size={20} />}
                        setAnchor={setAdminAnchor}
                        event={() => setDialogAccount(true)}
                    />
                    <AdminMenuItem
                        text="System Settings"
                        icon={<MdSettings size={20} />}
                        setAnchor={setAdminAnchor}
                        event={() => nav("/settings")}
                    />
                    <AdminMenuItem
                        text="Log Out"
                        icon={<MdLogout size={20} />}
                        setAnchor={setAdminAnchor}
                        event={() => loginState.loggedIn && loginState.logout()}
                    />
                </Menu>
            </AppBar>
            <Box className="content-area">
                <Outlet />
            </Box>
            <Paper className="footer">
                <Stack spacing={1} direction="row" className="content">
                    <MdStar />
                    <span>Created @ RIT by Dax Harris</span>
                    <span>•</span>
                    <a href="https://github.com/iTecAI/doesitwork">GitHub</a>
                    <MdStar />
                </Stack>
                {loginState.loggedIn ? (
                    <Button
                        size="small"
                        className="admin-login-btn"
                        onClick={(event) => (loginState as any).logout()}
                    >
                        Log Out
                    </Button>
                ) : (
                    <Button
                        size="small"
                        className="admin-login-btn"
                        onClick={(event) => setLoginAnchor(event.currentTarget)}
                    >
                        Admin Login
                    </Button>
                )}
            </Paper>
            <Popover
                open={Boolean(loginAnchor)}
                anchorEl={loginAnchor}
                onClose={() => {
                    setLoginAnchor(null);
                    setLoginUsername("");
                    setLoginPassword("");
                    setLoginError(false);
                }}
                className="admin-login"
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                transformOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Stack spacing={2}>
                    <Typography className="title" variant="h6">
                        Login
                    </Typography>
                    <TextField
                        className="username"
                        value={loginUsername}
                        onChange={(event) =>
                            setLoginUsername(event.target.value)
                        }
                        label="Username"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <MdPerson size={20} />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <TextField
                        className="password"
                        value={loginPassword}
                        onChange={(event) =>
                            setLoginPassword(event.target.value)
                        }
                        label="Password"
                        type="password"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <MdPassword size={20} />
                                </InputAdornment>
                            ),
                        }}
                    />
                    {loginError && (
                        <Alert severity="error">
                            Incorrect Username/Password
                        </Alert>
                    )}
                    <Button
                        variant="contained"
                        startIcon={<MdLogin />}
                        disabled={
                            loginUsername.length === 0 ||
                            loginPassword.length === 0
                        }
                        onClick={() => {
                            loginState
                                .login(loginUsername, loginPassword)
                                .then((successful) => {
                                    if (successful) {
                                        setLoginAnchor(null);
                                        setLoginUsername("");
                                        setLoginPassword("");
                                        setLoginError(false);
                                    } else {
                                        setLoginError(true);
                                    }
                                });
                        }}
                    >
                        Login
                    </Button>
                </Stack>
            </Popover>
            <AccountSettingsDialog
                open={dialogAccount}
                setOpen={setDialogAccount}
            />
        </Box>
    );
}
