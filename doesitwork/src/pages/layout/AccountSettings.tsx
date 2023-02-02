import {
    Accordion,
    AccordionActions,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    InputAdornment,
    TextField,
} from "@mui/material";
import { Stack } from "@mui/system";
import { useEffect, useState } from "react";
import { MdCancel, MdCheck, MdEmail, MdPerson } from "react-icons/md";
import { post } from "../../util/api";
import { useLogin } from "../../util/LoginState";

const EMAIL_REGEX =
    /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

export function AccountSettingsDialog(props: {
    open: boolean;
    setOpen: (open: boolean) => void;
}) {
    const login = useLogin();

    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");

    const [cpass, setCpass] = useState<string>("");
    const [npass, setNpass] = useState<string>("");
    const [ncpass, setNCpass] = useState<string>("");
    const [passOpen, setPassOpen] = useState<boolean>(false);
    const [passFail, setPassFail] = useState<boolean>(false);

    useEffect(() => {
        if (props.open && login.loggedIn) {
            setName(login.user.name);
            setEmail(login.user.email);
        }
    }, [props.open, login]);

    function close() {
        props.setOpen(false);
        setCpass("");
        setNpass("");
        setNCpass("");
        setName("");
        setEmail("");
        setPassFail(false);
    }

    return (
        <Dialog open={props.open} onClose={close} maxWidth="sm" fullWidth>
            <DialogTitle>Account Settings</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ marginTop: "8px" }}>
                    <TextField
                        fullWidth
                        label="Username"
                        placeholder="Jane Doe"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <MdPerson size={20} />
                                </InputAdornment>
                            ),
                        }}
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                    />
                    <TextField
                        fullWidth
                        label="Email"
                        placeholder="janedoe@gmail.com"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <MdEmail size={20} />
                                </InputAdornment>
                            ),
                        }}
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        error={
                            email.length > 0 &&
                            email.toLowerCase().match(EMAIL_REGEX) === null
                        }
                    />
                    <Accordion expanded={passOpen}>
                        <AccordionSummary onClick={() => setPassOpen(true)}>
                            Change Password
                        </AccordionSummary>
                        <AccordionDetails>
                            <Stack spacing={1}>
                                <TextField
                                    fullWidth
                                    label="Current Password"
                                    value={cpass}
                                    onChange={(event) =>
                                        setCpass(event.target.value)
                                    }
                                    type="password"
                                    size="small"
                                />
                                <Stack spacing={1} direction="row">
                                    <TextField
                                        label="New Password"
                                        value={npass}
                                        onChange={(event) =>
                                            setNpass(event.target.value)
                                        }
                                        type="password"
                                        size="small"
                                        sx={{ width: "50%" }}
                                        error={npass !== ncpass}
                                        helperText={
                                            npass !== ncpass
                                                ? "Passwords do not match"
                                                : undefined
                                        }
                                    />
                                    <TextField
                                        label="Confirm New Password"
                                        value={ncpass}
                                        onChange={(event) =>
                                            setNCpass(event.target.value)
                                        }
                                        type="password"
                                        size="small"
                                        sx={{ width: "50%" }}
                                        error={npass !== ncpass}
                                        helperText={
                                            npass !== ncpass
                                                ? "Passwords do not match"
                                                : undefined
                                        }
                                    />
                                </Stack>
                                {passFail && (
                                    <Alert severity="error">
                                        Current password incorrect.
                                    </Alert>
                                )}
                            </Stack>
                        </AccordionDetails>
                        <AccordionActions>
                            <Stack spacing={1} direction="row">
                                <Button
                                    startIcon={<MdCancel size={20} />}
                                    onClick={() => {
                                        setPassOpen(false);
                                        setCpass("");
                                        setNpass("");
                                        setNCpass("");
                                        setPassFail(false);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    startIcon={<MdCheck size={20} />}
                                    variant="outlined"
                                    disabled={
                                        cpass.length === 0 ||
                                        npass.length === 0 ||
                                        ncpass.length === 0 ||
                                        npass !== ncpass
                                    }
                                    onClick={() => {
                                        post<null>("/admin/settings/password", {
                                            data: {
                                                current: cpass,
                                                new: npass,
                                            },
                                        }).then((result) => {
                                            if (
                                                result.success &&
                                                login.loggedIn
                                            ) {
                                                login.refresh();
                                                setPassOpen(false);
                                                setCpass("");
                                                setNpass("");
                                                setNCpass("");
                                                setPassFail(false);
                                            } else {
                                                setPassFail(true);
                                            }
                                        });
                                    }}
                                >
                                    Change Password
                                </Button>
                            </Stack>
                        </AccordionActions>
                    </Accordion>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Stack spacing={1} direction="row">
                    <Button startIcon={<MdCancel size={20} />} onClick={close}>
                        Cancel
                    </Button>
                    <Button
                        startIcon={<MdCheck size={20} />}
                        variant="contained"
                        disabled={
                            (email.length > 0 &&
                                email.toLowerCase().match(EMAIL_REGEX) ===
                                    null) ||
                            name.length === 0
                        }
                        onClick={() => {
                            post<null>("/admin/settings", {
                                data: {
                                    name,
                                    email,
                                },
                            }).then((result) => {
                                if (result.success && login.loggedIn) {
                                    login.refresh();
                                    close();
                                }
                            });
                        }}
                    >
                        Submit
                    </Button>
                </Stack>
            </DialogActions>
        </Dialog>
    );
}
