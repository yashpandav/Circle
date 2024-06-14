import React, { useState } from 'react';
import Button from '@mui/material/Button';
import MuiDialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { TextField, Box, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { useSelector } from 'react-redux';
import { joinClass } from '../../../../../Api/apiCaller/classapicaller';
import './joinClassDialog.css';
import toast from 'react-hot-toast';

const JoinClassDialog = ({ setJoinDialog }) => {

    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    const { setUser } = useSelector((state) => state.auth);
    const [role, setRole] = useState(undefined);
    const [classCode, setClassCode] = useState(null);

    const handleClose = () => {
        setJoinDialog(false);
    };

    const handleRoleChange = (event) => {
        setRole(event.target.value);
    };

    const handleClassCodeChange = (event) => {
        setClassCode(event.target.value);
    };

    const handleSubmit = async () => {
        if (!classCode) {
            toast.error('Enter circle code')
            return;
        }
        if (role) {
            const formData = {
                joinAs: role,
                entryCode: classCode
            };
            console.log(JSON.stringify(formData, null, 2));
            setJoinDialog(false);
            await joinClass(formData);
        }
        else {
            toast.error('Select your role')
        }
    };

    return (
        <MuiDialog
            fullScreen={fullScreen}
            open={true}
            onClose={() => { }}
            aria-labelledby="responsive-dialog-title"
            className="fade-in-dialog"
        >
            <DialogTitle id="dialog-title">
                Join a Circle
            </DialogTitle>
            <DialogContent>
                <Box className="dialog-content">
                    <p className="dialog-subtitle">Circle Code</p>
                    <p className="dialog-text">Ask your teacher for the class code, then enter it here.</p>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="classCode"
                        label="Circle Code"
                        fullWidth
                        variant="outlined"
                        className="text-field"
                        value={classCode}
                        onChange={handleClassCodeChange}
                        required
                    />
                    <FormControl component="fieldset" className="radio-group">
                        <FormLabel component="legend" className="dialog-subtitle">Join As</FormLabel>
                        <RadioGroup
                            aria-label="role"
                            name="role"
                            value={role}
                            onChange={handleRoleChange}
                            row
                            required
                        >
                            <FormControlLabel value="Student" style={{ marginRight: '1.5rem' }} control={<Radio />} label="Student" />
                            <FormControlLabel value="Teacher" control={<Radio />} label="Teacher" />
                        </RadioGroup>
                    </FormControl>
                    <p className="dialog-text bold-text">To sign in with a class code</p>
                    <p className="dialog-text">
                        Use an authorized account... currently <span className="email-highlight">{setUser.email}</span>
                    </p>
                    <p className="dialog-text">Use a circle code with 5-7 letters or numbers, and no spaces or symbols.</p>
                    <p className="dialog-text">If you have trouble joining the class, contact Circle's admin or teacher.</p>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button variant="outlined" color="secondary" onClick={handleClose}>
                    Cancel
                </Button>
                <Button variant="contained" color="primary" onClick={handleSubmit}>
                    Join
                </Button>
            </DialogActions>
        </MuiDialog>
    );
};

export default JoinClassDialog;