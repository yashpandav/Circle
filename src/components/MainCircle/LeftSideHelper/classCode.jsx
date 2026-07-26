import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Tooltip from "@mui/material/Tooltip";
import LinkIcon from '@mui/icons-material/Link';
import { styled } from '@mui/material/styles';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import DisabledByDefaultOutlinedIcon from '@mui/icons-material/DisabledByDefaultOutlined';
import { Divider, IconButton, Typography } from "@mui/material";
import { changeEntryCode, toggleEntryCodeStatus } from '../../../Api/apiCaller/classapicaller.js'
import "./classCode.css";

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

export default function ClassCodeComponent() {
    const currClass = useSelector((state) => state.classes.currClass);
    const currUser = useSelector((state) => state.auth.user);
    const [tooltipOpen, setTooltipOpen] = useState(false);
    const [menuAnchorEl, setMenuAnchorEl] = useState(null);
    const [isAdmin, setAdmin] = useState(false);

    const dispatch = useDispatch();

    React.useEffect(() => {
        if (currUser && currClass) {
            if (currClass.admin && currUser._id === currClass.admin._id) {
                setAdmin(true);
            }
        }
    }, [currUser, currClass]);

    const handleMenuOpen = (event) => {
        setMenuAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setMenuAnchorEl(null);
    };

    const copyCodeToClipboard = () => {
        navigator.clipboard.writeText(currClass.entryCode);
        setTooltipOpen(true);
        handleMenuClose();
        setTimeout(() => {
            setTooltipOpen(false);
        }, 2000);
    };

    const copyUrlToClipboard = () => {
        navigator.clipboard.writeText(currClass.entryUrl);
        setTooltipOpen(true);
        handleMenuClose();
        setTimeout(() => {
            setTooltipOpen(false);
        }, 2000);
    }

    const resetCodeHandler = () => {
        let id = currClass._id;
        handleMenuClose();
        dispatch(changeEntryCode({ id, dispatch }));
    }

    const toggleCodeHandler = () => {
        let id = currClass._id;
        handleMenuClose();
        dispatch(toggleEntryCodeStatus({ id, dispatch }));
    }

    if (!isAdmin) return null;

    const isActive = currClass.isCodeActive !== false;

    return (
        <div className="main-circle-code-container">
            <div className="entry-code-header">
                <h4>Entry Code</h4>
                <IconButton className={`btn-more ${menuAnchorEl ? 'clicked' : ''}`} onClick={handleMenuOpen} size="small">
                    <MoreVertIcon fontSize="small" />
                </IconButton>
            </div>
            <div className="entry-code" style={{ opacity: isActive ? 1 : 0.5 }}>
                {isActive ? currClass.entryCode : 'TURNED OFF'}
                {isActive && (
                    <CustomTooltip
                        title="Copied!"
                        placement="bottom"
                        open={tooltipOpen}
                        disableFocusListener
                        disableHoverListener
                        disableTouchListener
                    >
                        <ContentCopyIcon onClick={copyCodeToClipboard} />
                    </CustomTooltip>
                )}
            </div>

            <Menu
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={handleMenuClose}
                style={{
                    marginTop: '0px',
                    marginLeft: '29px',
                    borderRadius: '5px',
                    boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.1)',
                }}
            >
                {isActive && (
                    <MenuItem onClick={copyCodeToClipboard}>
                        <ContentCopyIcon fontSize="small" sx={{ marginRight: '15px' }} />
                        Copy Invitation Code
                    </MenuItem>
                )}
                {isActive && <Divider />}
                {isActive && (
                    <MenuItem onClick={copyUrlToClipboard}>
                        <LinkIcon sx={{ marginRight: '15px', transform: 'rotate(60deg)' }} />
                        Copy Invitation Link
                    </MenuItem>
                )}
                {isActive && <Divider />}
                {isActive && (
                    <MenuItem onClick={resetCodeHandler}>
                        <RestartAltIcon sx={{ marginRight: '15px' }} />
                        Reset Code
                    </MenuItem>
                )}
                {isActive && <Divider />}
                <MenuItem onClick={toggleCodeHandler}>
                    <DisabledByDefaultOutlinedIcon sx={{ marginRight: '15px' }} />
                    {isActive ? "Turn Off" : "Turn On"}
                </MenuItem>
            </Menu>
        </div>
    );
}