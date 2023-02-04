import {
    Grid,
    IconButton,
    InputAdornment,
    Popover,
    TextField,
    Tooltip,
    useTheme,
} from "@mui/material";
import { cloneElement, useEffect, useState } from "react";
import * as Icons from "react-icons/md";
import "./style.scss";
import { MdClear } from "react-icons/md";

export function IconSelector(props: {
    value: string;
    onChange: (value: string) => void;
    trigger: JSX.Element;
}) {
    const [anchor, setAnchor] = useState<null | HTMLElement>(null);
    const [disp, setDisp] = useState<number>(120);
    const [search, setSearch] = useState<string>("");
    const theme = useTheme();

    useEffect(() => {
        if (anchor) {
            setDisp(120);
        }
    }, [anchor]);

    return (
        <>
            {cloneElement(props.trigger, {
                onClick: (event: any) => setAnchor(event.currentTarget),
            })}
            <Popover
                anchorEl={anchor}
                open={Boolean(anchor)}
                onClose={() => setAnchor(null)}
                className="icon-selector-menu"
            >
                <TextField
                    className="search-bar"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    label="Search Icons"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Icons.MdSearch size={24} />
                            </InputAdornment>
                        ),
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={() => setSearch("")}>
                                    <MdClear size={24} />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                    fullWidth
                    placeholder="The Best Icons Around"
                />
                <div
                    className="scroll-area"
                    onScroll={(ev) => {
                        if (
                            ev.currentTarget.clientHeight +
                                ev.currentTarget.scrollTop >=
                                ev.currentTarget.scrollHeight - 60 &&
                            disp < Object.keys(Icons).length
                        ) {
                            setDisp(disp + 60);
                        }
                    }}
                >
                    <Grid className="icon-grid" container>
                        {Object.keys(Icons)
                            .filter(
                                (v) =>
                                    search === "" ||
                                    search
                                        .toLowerCase()
                                        .includes(v.toLowerCase()) ||
                                    v
                                        .toLowerCase()
                                        .includes(search.toLowerCase())
                            )
                            .slice(0, disp)
                            .map((k) => (
                                <Grid
                                    item
                                    className={`icon-item${
                                        props.value === k ? " selected" : ""
                                    }`}
                                    xs={3}
                                    sm={2}
                                    lg={1}
                                    key={k}
                                    onClick={() => {
                                        if (props.value === k) {
                                            props.onChange("");
                                        } else {
                                            props.onChange(k);
                                            setAnchor(null);
                                        }
                                    }}
                                >
                                    <Tooltip
                                        title={k.slice(2)}
                                        placement="bottom"
                                        disableInteractive
                                    >
                                        <span>
                                            {(Icons as any)[k]({
                                                size: 20,
                                                style: {
                                                    borderColor:
                                                        theme.palette.primary
                                                            .main,
                                                },
                                            })}
                                        </span>
                                    </Tooltip>
                                </Grid>
                            ))}
                    </Grid>
                </div>
            </Popover>
        </>
    );
}
