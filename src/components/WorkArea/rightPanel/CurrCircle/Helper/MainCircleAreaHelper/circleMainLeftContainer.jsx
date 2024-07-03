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
import "./circleMainLeftContainer.css";
import { Divider } from "@mui/material";
import {changeEntryCode} from '../../../../../../Api/apiCaller/classapicaller.js';

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

    const dispatch = useDispatch();

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
        dispatch(changeEntryCode({id , dispatch}));
    }

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
                    <ContentCopyIcon onClick={copyCodeToClipboard} />
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
                <MenuItem onClick={copyCodeToClipboard}>
                    <ContentCopyIcon fontSize="small" sx={{ marginRight: '15px' }} />
                    Copy Invitation Code
                </MenuItem>
                <Divider />
                <MenuItem onClick={copyUrlToClipboard}>
                    <LinkIcon sx={{ marginRight: '15px', transform: 'rotate(60deg)' }} />
                    Copy Invitation Link
                </MenuItem>
                <Divider />
                <MenuItem onClick={resetCodeHandler}>
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