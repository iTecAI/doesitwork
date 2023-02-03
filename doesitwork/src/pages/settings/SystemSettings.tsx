import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    InputAdornment,
    Paper,
    TextField,
    Typography,
} from "@mui/material";
import { Stack } from "@mui/system";
import { useConfirm } from "material-ui-confirm";
import { ReactNode, useEffect, useState } from "react";
import {
    MdAccountCircle,
    MdAdd,
    MdCancel,
    MdCategory,
    MdCheck,
    MdChevronLeft,
    MdChevronRight,
    MdDelete,
    MdEmail,
    MdLocationPin,
    MdPassword,
    MdPerson,
    MdQuestionAnswer,
    MdRefresh,
    MdStar,
} from "react-icons/md";
import { useNavigate } from "react-router";
import { AdminUser } from "../../types";
import { del, get, put } from "../../util/api";
import { useLogin } from "../../util/LoginState";
import { EMAIL_REGEX } from "../layout/AccountSettings";
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
    const confirm = useConfirm();

    function refresh() {
        get<AdminUser[]>("/admin/all").then((result) => {
            if (result.success) {
                setUsers(result.data);
            }
        });
    }

    useEffect(refresh, [login]);

    const [creating, setCreating] = useState<boolean>(false);

    // New User Dialog
    const [newName, setNewName] = useState<string>("");
    const [newEmail, setNewEmail] = useState<string>("");
    const [newPassword, setNewPassword] = useState<string>("");
    const [newPasswordConfirm, setNewPasswordConfirm] = useState<string>("");

    function closeNew() {
        setCreating(false);
        setNewName("");
        setNewEmail("");
        setNewPassword("");
        setNewPasswordConfirm("");
    }

    return (
        <PanelWrapper
            text="Users"
            icon={<MdAccountCircle size={24} />}
            refresh={refresh}
        >
            <Stack spacing={2}>
                {users.map((v) => (
                    <Paper className="user-item" key={v.user_id} elevation={4}>
                        <Typography variant="body1" className="username">
                            {v.name}
                        </Typography>
                        <Typography variant="body2" className="email">
                            {v.email}
                        </Typography>
                        {login.loggedIn && v.user_id !== login.user.user_id ? (
                            <IconButton
                                className="delete"
                                color="error"
                                onClick={() =>
                                    confirm({
                                        description: `Confirm: Deletion of user ${v.name}`,
                                    }).then(() => {
                                        del<null>(`/admin/${v.user_id}`).then(
                                            (result) => {
                                                if (result.success) {
                                                    login.refresh();
                                                }
                                            }
                                        );
                                    })
                                }
                            >
                                <MdDelete />
                            </IconButton>
                        ) : (
                            <MdStar className="current-user" size={24} />
                        )}
                    </Paper>
                ))}
                <Button
                    className="new-user-btn"
                    startIcon={<MdAdd />}
                    variant="outlined"
                    onClick={() => setCreating(true)}
                >
                    Add User
                </Button>
            </Stack>
            <Dialog
                open={creating}
                onClose={closeNew}
                className="create-user-dialog"
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Create User</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ marginTop: "8px" }}>
                        <TextField
                            label="Username"
                            placeholder="Jane Doe"
                            value={newName}
                            onChange={(event) => setNewName(event.target.value)}
                            fullWidth
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <MdPerson />
                                    </InputAdornment>
                                ),
                            }}
                            required
                        />
                        <TextField
                            label="Email"
                            placeholder="janedoe@gmail.com"
                            value={newEmail}
                            onChange={(event) =>
                                setNewEmail(event.target.value)
                            }
                            fullWidth
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <MdEmail />
                                    </InputAdornment>
                                ),
                            }}
                            error={
                                newEmail.length > 0 &&
                                newEmail.match(EMAIL_REGEX) === null
                            }
                            helperText={
                                newEmail.length > 0 &&
                                newEmail.match(EMAIL_REGEX) === null
                                    ? "Must be a valid email"
                                    : undefined
                            }
                        />
                        <Stack spacing={2} direction="row">
                            <TextField
                                label="Password"
                                value={newPassword}
                                onChange={(event) =>
                                    setNewPassword(event.target.value)
                                }
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <MdPassword />
                                        </InputAdornment>
                                    ),
                                }}
                                error={newPassword !== newPasswordConfirm}
                                helperText={
                                    newPassword !== newPasswordConfirm
                                        ? "Passwords must match"
                                        : undefined
                                }
                                sx={{ width: "50%" }}
                                type="password"
                                required
                            />
                            <TextField
                                label="Confirm Password"
                                value={newPasswordConfirm}
                                onChange={(event) =>
                                    setNewPasswordConfirm(event.target.value)
                                }
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <MdPassword />
                                        </InputAdornment>
                                    ),
                                }}
                                error={newPassword !== newPasswordConfirm}
                                helperText={
                                    newPassword !== newPasswordConfirm
                                        ? "Passwords must match"
                                        : undefined
                                }
                                sx={{ width: "50%" }}
                                type="password"
                                required
                            />
                        </Stack>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Stack spacing={1} direction="row">
                        <Button startIcon={<MdCancel />} onClick={closeNew}>
                            Cancel
                        </Button>
                        <Button
                            startIcon={<MdCheck />}
                            onClick={() => {
                                closeNew();
                                put<string>("/admin", {
                                    data: {
                                        name: newName,
                                        email: newEmail,
                                        password: newPassword,
                                    },
                                }).then((result) => {
                                    if (result.success && login.loggedIn) {
                                        login.refresh();
                                    }
                                });
                            }}
                            variant="contained"
                            disabled={
                                !(
                                    newName.length > 0 &&
                                    newPassword.length > 0 &&
                                    newPasswordConfirm.length > 0 &&
                                    newPassword === newPasswordConfirm &&
                                    (newEmail.length === 0 ||
                                        newEmail.match(EMAIL_REGEX) !== null)
                                )
                            }
                        >
                            Create
                        </Button>
                    </Stack>
                </DialogActions>
            </Dialog>
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
