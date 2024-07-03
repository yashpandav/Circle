import React, { useState } from "react";
import { useSelector } from "react-redux";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Tooltip from "@mui/material/Tooltip";
import LinkIcon from '@mui/icons-material/Link';
import { styled } from '@mui/material/styles';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import DisabledByDefaultOutlinedIcon from '@mui/icons-material/DisabledByDefaultOutlined';
import "./circleMainLeftContainer.css";
import { Divider } from "@mui/material";

const CustomTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
    "& .MuiTooltip-tooltip": {
        backgroundColor: 'rgba(21, 111, 133, 0.8)',
        color: '#ffffff',
        boxShadow: theme.shadows[1],
        fontSize: 14,
        borderRadius: '5px',
        padding: '10px',
    },
}));

export default function CircleMainLeftContainer() {
    const currClass = useSelector((state) => state.classes.currClass);
    const [tooltipOpen, setTooltipOpen] = useState(false);
    const [menuAnchorEl, setMenuAnchorEl] = useState(null);

    const handleMenuOpen = (event) => {
        setMenuAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setMenuAnchorEl(null);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(currClass.entryCode);
        setTooltipOpen(true);
        handleMenuClose();
        setTimeout(() => {
            setTooltipOpen(false);
        }, 2000);
    };

    return (
        <div className="main-circle-left-container">
            <div className="entry-code-header">
                <pre>Entry Code</pre>
                <MoreVertIcon onClick={handleMenuOpen} className={`${menuAnchorEl ? 'clicked' : ''}`} />
            </div>
            {
                menuAnchorEl && (
                    <div className="menu-icon-copy-clicked"></div>
                )
            }
            <div className="entry-code">
                {currClass.entryCode}
                <CustomTooltip
                    title="Copied!"
                    placement="bottom"
                    open={tooltipOpen}
                    disableFocusListener
                    disableHoverListener
                    disableTouchListener
                >
                    <ContentCopyIcon onClick={copyToClipboard} />
                </CustomTooltip>
            </div>

            <Menu
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={handleMenuClose}
                style={{
                    marginTop: '-180px',
                    marginLeft: '19px',
                    borderRadius: '5px',
                    boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.1)',
                }}
            >
                <MenuItem onClick={copyToClipboard}>
                    <ContentCopyIcon fontSize="small" sx={{ marginRight: '15px' }} />
                    Copy Invitation Code
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleMenuClose}>
                    <LinkIcon sx={{ marginRight: '15px', transform: 'rotate(60deg)' }} />
                    Copy Invitation Link
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleMenuClose}>
                    <RestartAltIcon sx={{ marginRight: '15px' }} />
                    Reset Code
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleMenuClose}>
                    <DisabledByDefaultOutlinedIcon sx={{ marginRight: '15px' }} />
                    Turn Off
                </MenuItem>
            </Menu>
        </div>
    );
}