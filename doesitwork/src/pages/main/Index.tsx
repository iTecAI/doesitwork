import {
    Autocomplete,
    Button,
    Chip,
    IconButton,
    InputAdornment,
    ListItem,
    ListItemIcon,
    ListItemText,
    Paper,
    TextField,
    Typography,
    useTheme,
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
import { useLogin } from "../../util/LoginState";

type Search = {
    selectors: (Category | Location)[];
    text: string;
};

function ServiceItem(props: { self: Service; categories: Category[] }) {
    return <Paper className="service-item"></Paper>;
}

function LocationItem(props: {
    self: Location;
    expanded: string[];
    locations: Location[];
    categories: Category[];
    services: Service[];
    search: Search;
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
                    />
                )),
            ...props.services
                .filter((v) => v.location === props.self.location_id)
                .map((v) => (
                    <ServiceItem
                        self={v}
                        key={v.service_id}
                        categories={props.categories}
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
                                    <Button
                                        className="new-service"
                                        variant="outlined"
                                        startIcon={<MdIcons.MdAdd />}
                                    >
                                        New Service
                                    </Button>
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

    useEffect(() => {
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
    }, [location]);

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
                        />
                    ))}
            </Paper>
        </Box>
    );
}
