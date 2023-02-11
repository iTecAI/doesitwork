import {
    useMediaQuery,
    Paper,
    Stack,
    FormControl,
    InputLabel,
    Select,
    OutlinedInput,
    Typography,
    MenuItem,
    TextField,
    Button,
    IconButton,
} from "@mui/material";
import { useState, useEffect } from "react";
import { Category, Location } from "../../types";
import { post } from "../../util/api";
import * as MdIcons from "react-icons/md";
import "./index.scss";

export function CreateNewService(props: {
    location: Location;
    categories: Category[];
    reload: () => void;
}) {
    const [category, setCategory] = useState<string>("");
    const [name, setName] = useState<string>("");

    useEffect(() => {
        setCategory(props.categories[0] ? props.categories[0].category_id : "");
    }, []);
    const mobile = useMediaQuery("(max-width:800px)");

    return (
        <Paper className="service-item-create">
            <Stack spacing={1} direction={mobile ? "column" : "row"}>
                <FormControl className="category-select">
                    <InputLabel id="category-select-label" required>
                        Category
                    </InputLabel>
                    <Select
                        labelId="category-select-label"
                        value={category}
                        onChange={(event) => setCategory(event.target.value)}
                        input={
                            <OutlinedInput
                                label="Category"
                                required
                                size="small"
                            />
                        }
                        renderValue={(value: string) => {
                            const c: Category = props.categories.filter(
                                (v) => v.category_id === value
                            )[0];
                            return (
                                <Stack spacing={1} direction="row">
                                    {(MdIcons as any)[c.icon] ? (
                                        (MdIcons as any)[c.icon]({
                                            size: 24,
                                            className: "icon",
                                        })
                                    ) : (
                                        <MdIcons.MdError
                                            size={24}
                                            className="icon"
                                        />
                                    )}
                                    <Typography>{c.name}</Typography>
                                </Stack>
                            );
                        }}
                    >
                        {props.categories.map((c) => (
                            <MenuItem key={c.category_id} value={c.category_id}>
                                <Stack spacing={1} direction="row">
                                    {(MdIcons as any)[c.icon] ? (
                                        (MdIcons as any)[c.icon]({
                                            size: 24,
                                            className: "icon",
                                        })
                                    ) : (
                                        <MdIcons.MdError
                                            size={24}
                                            className="icon"
                                        />
                                    )}
                                    <Typography>{c.name}</Typography>
                                </Stack>
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <TextField
                    fullWidth
                    className="service-name-field"
                    label="Name"
                    placeholder="New Service"
                    InputLabelProps={{ shrink: true }}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    size="small"
                />
                {mobile ? (
                    <Button
                        variant="outlined"
                        className="create-btn-mobile"
                        onClick={() => {
                            post<string>("/services", {
                                data: {
                                    name,
                                    category,
                                    location: props.location.location_id,
                                },
                            }).then((result) => {
                                if (result.success) {
                                    props.reload();
                                    setName("");
                                }
                            });
                        }}
                        disabled={name.length === 0}
                        startIcon={<MdIcons.MdCheck />}
                    >
                        Create
                    </Button>
                ) : (
                    <IconButton
                        color="success"
                        size="small"
                        className="create-btn"
                        onClick={() => {
                            post<string>("/services", {
                                data: {
                                    name,
                                    category,
                                    location: props.location.location_id,
                                },
                            }).then((result) => {
                                if (result.success) {
                                    props.reload();
                                    setName("");
                                }
                            });
                        }}
                        disabled={name.length === 0}
                    >
                        <MdIcons.MdCheck size={24} />
                    </IconButton>
                )}
            </Stack>
        </Paper>
    );
}
