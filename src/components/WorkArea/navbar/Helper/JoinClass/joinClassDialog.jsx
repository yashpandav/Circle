import React, { useState } from 'react';
import Button from '@mui/material/Button';
import MuiDialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { TextField, Box, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { joinClass } from '../../../../../Api/apiCaller/classapicaller';
import { joinedClass } from '../../../../../Api/apiCaller/userapicaller';
import toast from 'react-hot-toast';

const JoinClassDialog = ({ setJoinDialog }) => {

    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    const user = useSelector((state) => state.auth.user);
    const dispatch = useDispatch();
    const [classCode, setClassCode] = useState("");
    const [loading, setLoading] = useState(false);

    const handleClose = () => {
        setJoinDialog(false);
    };

    const handleClassCodeChange = (event) => {
        setClassCode(event.target.value);
    };

    const handleSubmit = async () => {
        if (!classCode) {
            toast.error('Enter circle code');
            return;
        }
        
        const formData = {
            entryCode: classCode
        };
        
        setLoading(true);
        const success = await joinClass(formData);
        if (success) {
            await dispatch(joinedClass({ dispatch }));
            setJoinDialog(false);
        }
        setLoading(false);
    };

    return (
        <MuiDialog
            fullScreen={fullScreen}
            open={true}
            onClose={() => { }}
            aria-labelledby="responsive-dialog-title"
            className="global-dialog"
        >
            <DialogTitle id="dialog-title" className="global-dialog-title">
                Join a Circle
            </DialogTitle>
            <DialogContent>
                <Box className="global-dialog-content">
                    <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1e293b', marginTop: '1rem', marginBottom: '0.2rem' }}>Circle Code</p>
                    <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0', marginBottom: '1rem' }}>Ask your teacher for the class code, then enter it here.</p>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="classCode"
                        label="Circle Code"
                        fullWidth
                        variant="outlined"
                        value={classCode}
                        onChange={handleClassCodeChange}
                        required
                        style={{ marginBottom: '1.5rem' }}
                    />
                    <p style={{ fontSize: '0.9rem', color: '#1e293b', fontWeight: 'bold', marginTop: '1rem', marginBottom: '0.2rem' }}>To sign in with a class code</p>
                    <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0' }}>
                        Use an authorized account... currently <span style={{ color: '#00a896', fontWeight: 'bold', backgroundColor: '#e6f6f4', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>{user.email}</span>
                    </p>
                    <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '1rem' }}>Use a circle code with 5-7 letters or numbers, and no spaces or symbols.</p>
                    <p style={{ fontSize: '0.9rem', color: '#64748b' }}>If you have trouble joining the class, contact Circle's admin or teacher.</p>
                </Box>
            </DialogContent>
            <DialogActions className="global-dialog-actions">
                <Button variant="outlined" className="global-dialog-btn-cancel" onClick={handleClose} disabled={loading}>
                    Cancel
                </Button>
                <Button variant="contained" className="global-dialog-btn-submit" onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Joining...' : 'Join'}
                </Button>
            </DialogActions>
        </MuiDialog>
    );
};

export default JoinClassDialog;