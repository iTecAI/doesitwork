import {
    Autocomplete,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    InputAdornment,
    Paper,
    TextField,
    Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { MdLocationPin } from "react-icons/md";
import { Location } from "../../../types";
import { get, post } from "../../../util/api";
import { PanelWrapper } from "../SystemSettings";
import { MdCancel, MdCheck } from "react-icons/md";
import * as MdIcons from "react-icons/md";
import { Stack } from "@mui/system";
import { IconSelector } from "../../../components/IconSelect/IconSelector";

function LocationItem(props: { location: Location }) {
    const [parent, setParent] = useState<string>(props.location.parent_id);

    useEffect(() => {
        if (
            props.location.parent_id !== "root" &&
            props.location.parent_id !== null
        ) {
            get<Location>(`/locations/${props.location.parent_id}`).then(
                (result) => {
                    if (result.success) {
                        setParent(result.data.name);
                    }
                }
            );
        }
    }, [props.location]);

    return (
        <Paper
            className={[
                "location-item",
                props.location.icon ? "icon" : "",
            ].join(" ")}
            elevation={4}
        >
            {props.location.icon && (MdIcons as any)[props.location.icon] ? (
                (MdIcons as any)[props.location.icon]({
                    size: 24,
                    className: "icon",
                })
            ) : (
                <MdLocationPin size={24} className="icon" />
            )}
            <Typography className="parent">
                {!parent || parent.length === 0 || parent === "root"
                    ? "Root"
                    : parent}
            </Typography>
            <Typography className="name">{props.location.name}</Typography>
            <Stack spacing={0.5} className="buttons" direction={"row"}>
                <IconButton>
                    <MdIcons.MdEdit size={20} />
                </IconButton>
                <IconButton color="error">
                    <MdIcons.MdDelete size={20} />
                </IconButton>
            </Stack>
        </Paper>
    );
}

function CreateLocationDialog(props: {
    open: boolean;
    setOpen: (open: boolean) => void;
    onCreate: () => void;
    locations: Location[];
}) {
    const [name, setName] = useState<string>("");
    const [parent, setParent] = useState<Location | null>(null);
    const [icon, setIcon] = useState<string>("");

    function close() {
        props.setOpen(false);
        setName("");
        setParent(null);
        setIcon("");
    }

    return (
        <Dialog maxWidth="sm" fullWidth open={props.open} onClose={close}>
            <DialogTitle>New Location</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ marginTop: "8px" }}>
                    <Stack spacing={1} direction={"row"}>
                        <IconSelector
                            value={icon}
                            onChange={setIcon}
                            trigger={
                                <Button
                                    variant="contained"
                                    startIcon={
                                        (MdIcons as any)[icon] ? (
                                            (MdIcons as any)[icon]({ size: 24 })
                                        ) : (
                                            <MdLocationPin size={24} />
                                        )
                                    }
                                    sx={{
                                        padding: "16px",
                                        minWidth: "0px",
                                        "& .MuiButton-startIcon": {
                                            margin: "0px",
                                        },
                                    }}
                                />
                            }
                        />
                        <TextField
                            label="Location Name"
                            required
                            placeholder="The Moon"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <MdLocationPin />
                                    </InputAdornment>
                                ),
                            }}
                            fullWidth
                        />
                    </Stack>
                    <Autocomplete
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Parent Location"
                                InputProps={{
                                    ...params.InputProps,
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <MdIcons.MdAccountTree size={20} />
                                            {params.InputProps.startAdornment}
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        )}
                        options={props.locations}
                        getOptionLabel={(option) => option.name}
                        onChange={(event, value) => setParent(value)}
                        value={parent}
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Stack spacing={1} direction="row">
                    <Button startIcon={<MdCancel />} onClick={close}>
                        Cancel
                    </Button>
                    <Button
                        startIcon={<MdCheck />}
                        onClick={() => {
                            post<string>("/locations", {
                                data: {
                                    name,
                                    parent: parent ? parent.location_id : null,
                                    icon,
                                },
                            }).then((result) => {
                                if (result.success) {
                                    props.onCreate();
                                }
                            });
                            close();
                        }}
                        variant="contained"
                        disabled={name.length === 0}
                    >
                        Submit
                    </Button>
                </Stack>
            </DialogActions>
        </Dialog>
    );
}

export function LocationPanel() {
    const [locations, setLocations] = useState<Location[]>([]);
    const [creating, setCreating] = useState<boolean>(false);

    function load() {
        get<Location[]>("/locations").then((result) => {
            if (result.success) {
                setLocations(result.data);
            }
        });
    }

    useEffect(load, []);

    return (
        <PanelWrapper text="Locations" icon={<MdLocationPin size={24} />}>
            <Stack spacing={2}>
                {locations.map((v) => (
                    <LocationItem location={v} key={v.location_id} />
                ))}
                <Button
                    variant="outlined"
                    startIcon={<MdIcons.MdAdd />}
                    onClick={() => setCreating(true)}
                >
                    Add Location
                </Button>
            </Stack>
            <CreateLocationDialog
                open={creating}
                setOpen={setCreating}
                locations={locations}
                onCreate={load}
            />
        </PanelWrapper>
    );
}
