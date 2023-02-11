import {
    Autocomplete,
    Chip,
    InputAdornment,
    ListItem,
    ListItemIcon,
    ListItemText,
    Paper,
    TextField,
} from "@mui/material";
import { Box, Stack } from "@mui/system";
import { useEffect, useState } from "react";
import { MdSearch } from "react-icons/md";
import { useLocation, useParams } from "react-router";
import { Category, Location, Service } from "../../types";
import { get } from "../../util/api";
import "./index.scss";
import * as MdIcons from "react-icons/md";
import { isEqual } from "lodash";
import { LocationItem } from "./LocationItem";

export function IndexPage() {
    const params: { location_id?: string } = useParams<{
        location_id?: string;
    }>();
    const location = useLocation();
    const [search, setSearch] = useState<string>("");
    const [searchOpts, setSearchOpts] = useState<(Location | Category)[]>([]);

    const [categories, setCategories] = useState<Category[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [services, setServices] = useState<Service[]>([]);

    function reload() {
        get<Category[]>("/categories").then((result) => {
            if (result.success) {
                setCategories(result.data);
            }
        });
        get<Location[]>("/locations").then((result) => {
            if (result.success) {
                setLocations(result.data);
            }
        });
        get<Service[]>("/services").then((result) => {
            if (result.success) {
                setServices(result.data);
            }
        });
    }

    useEffect(reload, [location]);

    useEffect(() => {}, [params]);

    return (
        <Box className="index-content">
            <Autocomplete
                className="search"
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Search"
                        InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                                <>
                                    <InputAdornment position="start">
                                        <MdSearch size={20} />
                                    </InputAdornment>
                                    {params.InputProps.startAdornment}
                                </>
                            ),
                        }}
                    />
                )}
                value={searchOpts}
                onChange={(event, value) => setSearchOpts(value)}
                inputValue={search}
                onInputChange={(event, value) => setSearch(value)}
                groupBy={(option) =>
                    Object.keys(option).includes("category_id")
                        ? "Categories"
                        : "Locations"
                }
                renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                        <Chip
                            icon={
                                (MdIcons as any)[option.icon] ? (
                                    (MdIcons as any)[option.icon]({
                                        size: 20,
                                    })
                                ) : Object.keys(option).includes(
                                      "category_id"
                                  ) ? (
                                    <MdIcons.MdMiscellaneousServices
                                        size={20}
                                    />
                                ) : (
                                    <MdIcons.MdLocationPin size={20} />
                                )
                            }
                            {...getTagProps({ index })}
                            key={index}
                            label={`${
                                Object.keys(option).includes("category_id")
                                    ? "Category"
                                    : "Location"
                            }: ${option.name}`}
                        />
                    ))
                }
                isOptionEqualToValue={(option, value) => isEqual(option, value)}
                getOptionLabel={(option) => option.name}
                clearOnBlur={false}
                clearOnEscape={false}
                renderOption={(props, option, { selected }) => (
                    <ListItem
                        {...props}
                        key={
                            (option as any).category_id ??
                            (option as any).location_id
                        }
                    >
                        <ListItemIcon>
                            {(MdIcons as any)[option.icon] ? (
                                (MdIcons as any)[option.icon]({ size: 20 })
                            ) : Object.keys(option).includes("category_id") ? (
                                <MdIcons.MdMiscellaneousServices size={20} />
                            ) : (
                                <MdIcons.MdLocationPin size={20} />
                            )}
                        </ListItemIcon>
                        <ListItemText>{option.name}</ListItemText>
                    </ListItem>
                )}
                options={[...categories, ...locations]}
                multiple
                fullWidth
            />
            <Paper className="content-area" variant="outlined">
                <Stack spacing={0.5}>
                    {locations
                        .filter(
                            (v) =>
                                v.parent_id === null ||
                                v.parent_id === "root" ||
                                v.parent_id === ""
                        )
                        .map((v) => (
                            <LocationItem
                                self={v}
                                expanded={[]}
                                categories={categories}
                                locations={locations}
                                services={services}
                                search={{
                                    selectors: searchOpts,
                                    text: search,
                                }}
                                reload={reload}
                                key={v.location_id}
                            />
                        ))}
                </Stack>
            </Paper>
        </Box>
    );
}
