import {
    Paper,
    Typography,
    Stack,
    IconButton,
    Button,
    Chip,
} from "@mui/material";
import { useConfirm } from "material-ui-confirm";
import { useState, useEffect } from "react";
import { MdCategory, MdLocationPin } from "react-icons/md";
import { del, get, post } from "../../../util/api";
import { PanelWrapper } from "../SystemSettings";
import { Category } from "../../../types";
import * as MdIcons from "react-icons/md";
import { useHorizontalScroll } from "../../../util/hscroll";

function CategoryItem(props: {
    category: Category;
    load: () => void;
    categories: Category[];
}) {
    const [editing, setEditing] = useState<boolean>(false);
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
                <MdLocationPin size={24} className="icon" />
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
                <IconButton onClick={() => setEditing(true)}>
                    <MdIcons.MdEdit size={20} />
                </IconButton>
                <IconButton
                    color="error"
                    onClick={() =>
                        confirm({
                            description: `This will permanently delete "${props.category.name}" and all services attached to it.`,
                        }).then(() => {
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
        </PanelWrapper>
    );
}
