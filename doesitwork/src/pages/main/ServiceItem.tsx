import {
    useMediaQuery,
    Paper,
    Stack,
    IconButton,
    Divider,
    Autocomplete,
    TextField,
    Chip,
    Typography,
    useTheme,
} from "@mui/material";
import { useConfirm } from "material-ui-confirm";
import { useMemo, useState } from "react";
import { Service, Category, Vote } from "../../types";
import { post, del } from "../../util/api";
import { useHorizontalScroll } from "../../util/hscroll";
import { useLogin } from "../../util/LoginState";
import { getChanceWorking, getFlagNumbers } from "../../util/voteCalculations";
import * as MdIcons from "react-icons/md";
import "./index.scss";
import { AxisOptions, Chart } from "react-charts";

function VoteGraph(props: { votes: Vote[] }) {
    const mobile = useMediaQuery("(max-width:800px)");
    const RANGE = mobile ? 7 : 14; // Days to cover
    const DAY_MS = 1000 * 60 * 60 * 24; // ms in one day (approx)
    const theme = useTheme();
    const data = useMemo(() => {
        const dateMapping: { [key: string]: Vote[] } = {};
        const tempDate = new Date(Date.now());
        tempDate.setHours(12, 0, 0, 0);
        const currentDate = tempDate.getTime();
        const startDate = currentDate - DAY_MS * RANGE;
        for (let d = startDate; d <= currentDate; d += DAY_MS) {
            const dateString = new Date(d).toDateString();
            dateMapping[dateString] = [
                ...props.votes.filter(
                    (v) =>
                        new Date(v.timestamp * 1000).toDateString() ===
                        dateString
                ),
            ];
        }

        const genData: any = [
            {
                label: "Working",
                data: Object.keys(dateMapping).map((d) => {
                    return {
                        date: d,
                        votes: dateMapping[d].filter((v) => v.working).length,
                    };
                }),
            },
            {
                label: "Not Working",
                data: Object.keys(dateMapping).map((d) => {
                    return {
                        date: d,
                        votes: dateMapping[d].filter((v) => !v.working).length,
                    };
                }),
            },
        ];
        return genData;
    }, []);

    const primaryAxis = useMemo(
        (): AxisOptions<{ date: string; votes: number }> => ({
            getValue: (datum) => datum.date,
        }),

        []
    );

    const secondaryAxes = useMemo(
        (): AxisOptions<{ date: string; votes: number }>[] => [
            {
                getValue: (datum) => datum.votes,
            },
        ],

        []
    );

    return (
        <Paper className="vote-chart-container">
            <Chart
                className="vote-chart"
                options={{
                    data,
                    primaryAxis,
                    secondaryAxes,
                    defaultColors: [
                        theme.palette.success.dark,
                        theme.palette.error.dark,
                    ],
                }}
            />
        </Paper>
    );
}

export function ServiceItem(props: {
    self: Service;
    categories: Category[];
    reload: () => void;
}) {
    const category: Category | null =
        props.categories.filter(
            (v) => props.self.category === v.category_id
        )[0] ?? null;
    const confirm = useConfirm();
    const login = useLogin();
    const theme = useTheme();
    const [voting, setVoting] = useState<boolean>(false);
    const mobile = useMediaQuery("(max-width:800px)");

    // Voting values
    const [flags, setFlags] = useState<string[]>([]);
    const [working, notWorking] = getChanceWorking(props.self.votes) ?? [0, 0];
    const flagCounts = getFlagNumbers(props.self.votes);
    const scref = useHorizontalScroll(0.05);

    return (
        <Paper
            className={
                "service-item" +
                (login.loggedIn ? " admin" : "") +
                (voting ? " voting" : "")
            }
            sx={{
                "&:hover": {
                    borderColor: `${theme.palette.primary.main} !important`,
                },
            }}
            onClick={() => {
                if (!voting) {
                    setVoting(true);
                    setFlags([]);
                }
            }}
        >
            {voting ? (
                <Stack className="vote-box" spacing={2} direction="column">
                    {mobile ? (
                        <>
                            <Stack
                                spacing={2}
                                direction="row"
                                sx={{ marginLeft: "auto", marginRight: "auto" }}
                            >
                                <IconButton
                                    color="success"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        post<Vote>(
                                            `/services/${props.self.service_id}/vote`,
                                            {
                                                data: {
                                                    status: true,
                                                    flags: [],
                                                },
                                            }
                                        ).then(() => {
                                            setFlags([]);
                                            setVoting(false);
                                            props.reload();
                                        });
                                    }}
                                >
                                    <MdIcons.MdThumbUp />
                                </IconButton>
                                <Divider
                                    orientation="vertical"
                                    sx={{
                                        minHeight: "40px",
                                    }}
                                />
                                <IconButton
                                    color="error"
                                    disabled={
                                        category.flags.length > 0 &&
                                        flags.length === 0
                                    }
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        post<Vote>(
                                            `/services/${props.self.service_id}/vote`,
                                            { data: { status: false, flags } }
                                        ).then(() => {
                                            setFlags([]);
                                            setVoting(false);
                                            props.reload();
                                        });
                                    }}
                                >
                                    <MdIcons.MdThumbDown />
                                </IconButton>
                                <Divider
                                    orientation="vertical"
                                    sx={{
                                        minHeight: "40px",
                                    }}
                                />
                                <IconButton
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setFlags([]);
                                        setVoting(false);
                                    }}
                                >
                                    <MdIcons.MdClose />
                                </IconButton>
                            </Stack>
                            <Autocomplete
                                options={category.flags}
                                multiple
                                fullWidth
                                size="small"
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="What's Wrong?"
                                    />
                                )}
                                value={flags}
                                onChange={(event, value) => setFlags(value)}
                            />
                        </>
                    ) : (
                        <Stack spacing={2} direction="row">
                            <IconButton
                                color="success"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    post<Vote>(
                                        `/services/${props.self.service_id}/vote`,
                                        { data: { status: true, flags: [] } }
                                    ).then(() => {
                                        setFlags([]);
                                        setVoting(false);
                                        props.reload();
                                    });
                                }}
                            >
                                <MdIcons.MdThumbUp />
                            </IconButton>
                            <Divider
                                orientation="vertical"
                                sx={{
                                    minHeight: "40px",
                                }}
                            />
                            <IconButton
                                color="error"
                                disabled={
                                    category.flags.length > 0 &&
                                    flags.length === 0
                                }
                                onClick={(e) => {
                                    e.stopPropagation();
                                    post<Vote>(
                                        `/services/${props.self.service_id}/vote`,
                                        { data: { status: false, flags } }
                                    ).then(() => {
                                        setFlags([]);
                                        setVoting(false);
                                        props.reload();
                                    });
                                }}
                            >
                                <MdIcons.MdThumbDown />
                            </IconButton>
                            <Autocomplete
                                options={category.flags}
                                multiple
                                fullWidth
                                size="small"
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="What's Wrong?"
                                    />
                                )}
                                value={flags}
                                onChange={(event, value) => setFlags(value)}
                            />
                            <Divider
                                orientation="vertical"
                                sx={{
                                    minHeight: "40px",
                                }}
                            />
                            <IconButton
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setFlags([]);
                                    setVoting(false);
                                }}
                            >
                                <MdIcons.MdClose />
                            </IconButton>
                        </Stack>
                    )}
                    <Paper className="problem-box" variant="outlined">
                        {Object.keys(flagCounts).length > 0 ? (
                            <div className="problem-scroll" ref={scref as any}>
                                <Stack
                                    spacing={0.5}
                                    className="problem-stack"
                                    direction="row"
                                >
                                    {Object.keys(flagCounts).map((flag) => (
                                        <Chip
                                            className="problem"
                                            key={flag}
                                            size="small"
                                            label={
                                                <>
                                                    {flag} :{" "}
                                                    {Math.round(
                                                        flagCounts[flag] * 100
                                                    )}
                                                    %
                                                </>
                                            }
                                        />
                                    ))}
                                </Stack>
                            </div>
                        ) : (
                            <span className="no-problems-container">
                                <Typography
                                    variant="overline"
                                    className="no-problems"
                                >
                                    No Problems Recorded
                                </Typography>
                            </span>
                        )}
                    </Paper>
                    <VoteGraph votes={props.self.votes} />
                </Stack>
            ) : (
                <>
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
                    <Typography className="service-name">
                        {props.self.name}
                    </Typography>
                    <Typography className="category-name">
                        {category ? category.name : "UNKNOWN"}
                    </Typography>
                    {login.loggedIn && (
                        <Stack
                            spacing={0.25}
                            direction="column"
                            className="service-actions"
                        >
                            <IconButton
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    confirm({
                                        description: `This will reset all votes for ${props.self.name}.`,
                                    }).then(() => {
                                        del(
                                            `/services/${props.self.service_id}/votes`
                                        ).then(() => props.reload());
                                    });
                                }}
                            >
                                <MdIcons.MdRefresh size={20} />
                            </IconButton>
                            <IconButton
                                color="error"
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    confirm({
                                        description: `This will permanently delete ${props.self.name}.`,
                                    }).then(() => {
                                        del(
                                            `/services/${props.self.service_id}`
                                        ).then(() => props.reload());
                                    });
                                }}
                            >
                                <MdIcons.MdDelete size={20} />
                            </IconButton>
                        </Stack>
                    )}
                    <div className="vote-bar">
                        <div
                            className="working bar"
                            style={{
                                width: `${working * 100}%`,
                                backgroundColor: theme.palette.success.main,
                            }}
                        />
                        <div
                            className="not-working bar"
                            style={{
                                width: `${notWorking * 100}%`,
                                backgroundColor: theme.palette.error.main,
                            }}
                        />
                    </div>
                </>
            )}
        </Paper>
    );
}
