import { Paper, Stack, Typography, IconButton, useTheme } from "@mui/material";
import { useState, useEffect } from "react";
import { Category, Service, Location } from "../../types";
import { useLogin } from "../../util/LoginState";
import { CreateNewService } from "./CreateService";
import { ServiceItem } from "./ServiceItem";
import * as MdIcons from "react-icons/md";
import "./index.scss";

type Search = {
    selectors: (Category | Location)[];
    text: string;
};

export function LocationItem(props: {
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
                        key={v.location_id}
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
                            <Stack spacing={0.5}>
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
