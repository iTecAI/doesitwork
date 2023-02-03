import {
    Stack,
    Paper,
    Typography,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    InputAdornment,
    DialogActions,
} from "@mui/material";
import { useConfirm } from "material-ui-confirm";
import { useState, useEffect } from "react";
import {
    MdAccountCircle,
    MdDelete,
    MdStar,
    MdAdd,
    MdPerson,
    MdEmail,
    MdPassword,
    MdCancel,
    MdCheck,
} from "react-icons/md";
import { AdminUser } from "../../../types";
import { del, put, get } from "../../../util/api";
import { useLogin } from "../../../util/LoginState";
import { EMAIL_REGEX } from "../../layout/AccountSettings";
import { PanelWrapper } from "../SystemSettings";

export function UserPanel() {
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
