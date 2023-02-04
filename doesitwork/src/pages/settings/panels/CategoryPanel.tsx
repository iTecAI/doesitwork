import {
    Paper,
    Typography,
    Stack,
    IconButton,
    Button,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    InputAdornment,
    TextField,
    Autocomplete,
    DialogActions,
} from "@mui/material";
import { useConfirm } from "material-ui-confirm";
import { useState, useEffect } from "react";
import { MdCategory } from "react-icons/md";
import { del, get, post } from "../../../util/api";
import { PanelWrapper } from "../SystemSettings";
import { Category } from "../../../types";
import * as MdIcons from "react-icons/md";
import { useHorizontalScroll } from "../../../util/hscroll";
import { IconSelector } from "../../../components/IconSelect/IconSelector";

type CategoryEdit = { name: string; icon: string; flags: string[] };

function CreateEditCategory(props: {
    data: Partial<CategoryEdit> | null;
    onClose: (data: CategoryEdit | null) => void;
    mode: "Create" | "Edit";
}) {
    const [name, setName] = useState<string>("");
    const [icon, setIcon] = useState<string>("");
    const [flags, setFlags] = useState<string[]>([]);

    function close(data: CategoryEdit | null) {
        props.onClose(data);
        setName("");
        setIcon("");
        setFlags([]);
    }

    useEffect(() => {
        if (props.data) {
            setName(props.data.name ?? "");
            setIcon(props.data.icon ?? "");
            setFlags(props.data.flags ?? []);
        }
    }, [props.data]);

    return (
        <Dialog
            open={Boolean(props.data)}
            onClose={() => close(null)}
            className="create-edit-category-dialog"
            fullWidth
            maxWidth="sm"
        >
            <DialogTitle>{props.mode} Category</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ marginTop: "8px" }}>
                    <Stack spacing={1} direction="row">
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
                                            <MdIcons.MdMiscellaneousServices
                                                size={24}
                                            />
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
                            label="Category Name"
                            required
                            placeholder="Laundry Machines"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <MdIcons.MdEdit />
                                    </InputAdornment>
                                ),
                            }}
                            fullWidth
                        />
                    </Stack>
                    <Autocomplete
                        className="flag-input"
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Flags"
                                InputProps={{
                                    ...params.InputProps,
                                    startAdornment: (
                                        <>
                                            <InputAdornment position="start">
                                                <MdIcons.MdFlag
                                                    className="adornment"
                                                    size={24}
                                                />
                                            </InputAdornment>
                                            {params.InputProps.startAdornment}
                                        </>
                                    ),
                                }}
                            />
                        )}
                        freeSolo
                        options={[]}
                        fullWidth
                        multiple
                        value={flags ?? []}
                        onChange={(event, value) => setFlags(value ?? [])}
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Stack spacing={1} direction="row">
                    <Button
                        startIcon={<MdIcons.MdCancel />}
                        onClick={() => props.onClose(null)}
                    >
                        Cancel
                    </Button>
                    <Button
                        startIcon={<MdIcons.MdCheck />}
                        onClick={() => {
                            props.onClose({ name, icon, flags });
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

function CategoryItem(props: {
    category: Category;
    load: () => void;
    categories: Category[];
}) {
    const [editing, setEditing] = useState<CategoryEdit | null>(null);
    const confirm = useConfirm();
    const scrollRef = useHorizontalScroll(0.1);

    return (
        <Paper
            className={[
                "category-item",
                props.category.icon ? "icon" : "",
            ].join(" ")}
            elevation={4}
        >
            {props.category.icon && (MdIcons as any)[props.category.icon] ? (
                (MdIcons as any)[props.category.icon]({
                    size: 24,
                    className: "icon",
                })
            ) : (
                <MdIcons.MdMiscellaneousServices size={24} className="icon" />
            )}
            <Typography className="name">{props.category.name}</Typography>
            {props.category.flags.length > 0 && (
                <div className="flag-container" ref={scrollRef as any}>
                    <Stack spacing={1} direction="row" className="flags">
                        {props.category.flags.map((v) => (
                            <Chip label={v} key={v} size="small" />
                        ))}
                    </Stack>
                </div>
            )}
            <Stack spacing={0.5} className="buttons" direction={"row"}>
                <IconButton onClick={() => setEditing({ ...props.category })}>
                    <MdIcons.MdEdit size={20} />
                </IconButton>
                <IconButton
                    color="error"
                    onClick={() =>
                        confirm({
                            description: `This will permanently delete "${props.category.name}" and all services attached to it.`,
                        }).then(() => {
                            console.log(props.category);
                            del<null>(
                                `/categories/${props.category.category_id}`
                            ).then((result) => {
                                if (result.success) {
                                    props.load();
                                }
                            });
                        })
                    }
                >
                    <MdIcons.MdDelete size={20} />
                </IconButton>
            </Stack>
            <CreateEditCategory
                data={editing}
                onClose={(data) => {
                    setEditing(null);
                    if (data) {
                        post<string>(
                            `/categories/${props.category.category_id}`,
                            { data }
                        ).then((result) => {
                            if (result.success) {
                                props.load();
                            }
                        });
                    }
                }}
                mode="Edit"
            />
        </Paper>
    );
}

export function CategoryPanel() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [creating, setCreating] = useState<boolean>(false);

    function load() {
        get<Category[]>("/categories").then((result) => {
            if (result.success) {
                setCategories(result.data);
            }
        });
    }

    useEffect(load, []);

    return (
        <PanelWrapper text="Categories" icon={<MdCategory size={24} />}>
            <Stack spacing={2}>
                {categories.map((v) => (
                    <CategoryItem
                        category={v}
                        key={v.category_id}
                        load={load}
                        categories={categories}
                    />
                ))}
                <Button
                    variant="outlined"
                    startIcon={<MdIcons.MdAdd />}
                    onClick={() => setCreating(true)}
                >
                    Add Category
                </Button>
            </Stack>
            <CreateEditCategory
                data={creating ? {} : null}
                onClose={(data) => {
                    setCreating(false);
                    if (data) {
                        post<string>(`/categories`, { data }).then((result) => {
                            if (result.success) {
                                load();
                            }
                        });
                    }
                }}
                mode="Create"
            />
        </PanelWrapper>
    );
}
