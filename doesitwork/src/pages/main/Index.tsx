import {
    Autocomplete,
    Chip,
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel,
    ListItem,
    ListItemIcon,
    ListItemText,
    MenuItem,
    OutlinedInput,
    Paper,
    Select,
    TextField,
    Typography,
    useTheme,
} from "@mui/material";
import { Box, Stack } from "@mui/system";
import { useEffect, useState } from "react";
import { MdSearch } from "react-icons/md";
import { useLocation, useParams } from "react-router";
import { Category, Location, Service } from "../../types";
import { get, post } from "../../util/api";
import "./index.scss";
import * as MdIcons from "react-icons/md";
import { isEqual } from "lodash";
import { useLogin } from "../../util/LoginState";

type Search = {
    selectors: (Category | Location)[];
    text: string;
};

function ServiceItem(props: {
    self: Service;
    categories: Category[];
    reload: () => void;
}) {
    const category: Category | null =
        props.categories.filter(
            (v) => props.self.category === v.category_id
        )[0] ?? null;
    return (
        <Paper className="service-item">
            {category ? (
                (MdIcons as any)[category.icon] ? (
                    (MdIcons as any)[category.icon]({
                        size: 24,
                        className: "icon",
                    })
                ) : (
                    <MdIcons.MdError size={24} className="icon" />
                )
            ) : (
                <MdIcons.MdError size={24} className="icon" />
            )}
            <Typography className="service-name">{props.self.name}</Typography>
            <Typography className="category-name">
                {category ? category.name : "UNKNOWN"}
            </Typography>
        </Paper>
    );
}

function CreateNewService(props: {
    location: Location;
    categories: Category[];
    reload: () => void;
}) {
    const [category, setCategory] = useState<string>("");
    const [name, setName] = useState<string>("");

    useEffect(() => {
        setCategory(props.categories[0] ? props.categories[0].category_id : "");
    }, []);

    return (
        <Paper className="service-item-create">
            <Stack spacing={1} direction="row">
                <FormControl className="category-select">
                    <InputLabel id="category-select-label" required>
                        Category
                    </InputLabel>
                    <Select
                        labelId="category-select-label"
                        value={category}
                        onChange={(event) => setCategory(event.target.value)}
                        input={<OutlinedInput label="Category" required />}
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
                />
                <IconButton
                    color="success"
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
            </Stack>
        </Paper>
    );
}

function LocationItem(props: {
    self: Location;
    expanded: string[];
    locations: Location[];
    categories: Category[];
    services: Service[];
    search: Search;
    reload: () => void;
}) {
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const login = useLogin();
    const theme = useTheme();

    const [children, setChildren] = useState<JSX.Element[]>([]);

    useEffect(() => {
        setChildren([
            ...props.locations
                .filter((v) => v.parent_id === props.self.location_id)
                .map((v) => (
                    <LocationItem
                        self={v}
                        expanded={[]}
                        categories={props.categories}
                        locations={props.locations}
                        services={props.services}
                        search={props.search}
                        reload={props.reload}
                    />
                )),
            ...props.services
                .filter((v) => v.location === props.self.location_id)
                .map((v) => (
                    <ServiceItem
                        self={v}
                        key={v.service_id}
                        categories={props.categories}
                        reload={props.reload}
                    />
                )),
        ]);
    }, [props]);

    return (
        <Paper
            className="location-item"
            sx={{ border: `1px solid ${theme.palette.primary.dark}` }}
        >
            <Stack spacing={2}>
                <Stack spacing={2} direction="row">
                    {(MdIcons as any)[props.self.icon] ? (
                        (MdIcons as any)[props.self.icon]({
                            size: 24,
                            className: "icon",
                        })
                    ) : (
                        <MdIcons.MdLocationPin size={24} className="icon" />
                    )}
                    <Typography className="location-name">
                        {props.self.name}
                    </Typography>
                    <IconButton
                        className={`expand-btn${
                            isExpanded ||
                            props.self.parent_id === null ||
                            props.self.parent_id === "root" ||
                            props.self.parent_id === ""
                                ? " expanded"
                                : ""
                        }`}
                        onClick={() => setIsExpanded(!isExpanded)}
                        disabled={
                            props.self.parent_id === null ||
                            props.self.parent_id === "root" ||
                            props.self.parent_id === ""
                        }
                    >
                        <MdIcons.MdArrowDropDown />
                    </IconButton>
                </Stack>
                {(isExpanded ||
                    props.self.parent_id === null ||
                    props.self.parent_id === "root" ||
                    props.self.parent_id === "") &&
                    (children.length > 0 || login.loggedIn) && (
                        <Paper variant="outlined" className="location-children">
                            <Stack spacing={1}>
                                {children}
                                {login.loggedIn && (
                                    <CreateNewService
                                        location={props.self}
                                        categories={props.categories}
                                        reload={props.reload}
                                    />
                                )}
                            </Stack>
                        </Paper>
                    )}
            </Stack>
        </Paper>
    );
}

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
                        />
                    ))}
            </Paper>
        </Box>
    );
}
