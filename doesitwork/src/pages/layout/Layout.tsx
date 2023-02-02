import { AppBar, Box, Button, Paper, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import { Outlet } from "react-router";
import "./layout.scss";
import { MdStar } from "react-icons/md";

export function Layout(props: { organization: string }) {
    return (
        <Box className="layout-root">
            <AppBar className="navbar">
                <Stack direction="row" spacing={1}>
                    <img
                        src="./icon.svg"
                        className="icon"
                        alt="Application icon"
                    />
                    <Typography variant="h5" className="title">
                        DoesItWork
                        {props.organization ? ` @ ${props.organization}` : ""}
                    </Typography>
                </Stack>
            </AppBar>
            <Box className="content-area">
                <Outlet />
            </Box>
            <Paper className="footer">
                <Typography className="content">
                    <Stack spacing={1} direction="row">
                        <MdStar />
                        <span>Created @ RIT by Dax Harris</span>
                        <span>•</span>
                        <a href="https://github.com/iTecAI/doesitwork">
                            GitHub
                        </a>
                        <MdStar />
                    </Stack>
                </Typography>
                <Button size="small" className="admin-login-btn">
                    Admin Login
                </Button>
            </Paper>
        </Box>
    );
}
