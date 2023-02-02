import {
    Alert,
    AppBar,
    Box,
    Button,
    InputAdornment,
    Paper,
    Popover,
    TextField,
    Typography,
} from "@mui/material";
import { Stack } from "@mui/system";
import { Outlet } from "react-router";
import "./layout.scss";
import { MdLogin, MdPassword, MdPerson, MdStar } from "react-icons/md";
import { useState } from "react";
import { useLogin } from "../../util/LoginState";

export function Layout(props: { organization: string }) {
    const [loginAnchor, setLoginAnchor] = useState<null | HTMLElement>(null);
    const loginState = useLogin();

    const [loginUsername, setLoginUsername] = useState<string>("");
    const [loginPassword, setLoginPassword] = useState<string>("");
    const [loginError, setLoginError] = useState<boolean>(false);

    return (
        <Box className="layout-root">
            <AppBar className="navbar">
                <Stack direction="row" spacing={1}>
                    <img
                        src="./icon.svg"
                        className="icon"
                        alt="Application icon"
                    />
                    <Typography variant="h5" className="title">
                        DoesItWork
                        {props.organization ? ` @ ${props.organization}` : ""}
                    </Typography>
                </Stack>
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
        </Box>
    );
}
