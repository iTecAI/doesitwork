import { Paper, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { MdLocationPin } from "react-icons/md";
import { Location } from "../../../types";
import { get } from "../../../util/api";
import { PanelWrapper } from "../SystemSettings";
import * as MdIcons from "react-icons/md";

function LocationItem(props: { location: Location }) {
    const [parent, setParent] = useState<string>(props.location.parent_id);

    useEffect(() => {
        if (props.location.parent_id !== "root") {
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
            {props.location.icon &&
                (MdIcons as any)[props.location.icon] &&
                (MdIcons as any)[props.location.icon]({
                    size: 24,
                    className: "icon",
                })}
            <Typography className="parent">{parent}</Typography>
            <Typography className="name">{props.location.name}</Typography>
        </Paper>
    );
}

export function LocationPanel() {
    const [locations, setLocations] = useState<Location[]>([]);

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
            {locations.map((v) => (
                <LocationItem location={v} key={v.location_id} />
            ))}
        </PanelWrapper>
    );
}
