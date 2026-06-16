import { Box } from "@mui/material";
import ArrowBackOutlined from "@mui/icons-material/ArrowBackOutlined";
import { useNavigate } from "react-router-dom";

function BackButton() {
    const navigate = useNavigate();

    return (
            <Box onClick={() => navigate(-1)}
                    sx={{width: 64, height: 64, borderRadius: "50%", bgcolor: "#12141b", color: "#6690ff",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        cursor: "pointer", transition: "0.2s",
                        "&:hover": {bgcolor: "#1a1d27", color: "#3f5fa3",},}}
            >
                <ArrowBackOutlined sx={{ fontSize: 34 }} />
            </Box>
    );
}

export default BackButton;