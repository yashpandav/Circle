import * as React from 'react';
import Button from '@mui/material/Button';
import MuiDialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

const CreateClassDialog = ({ setDialog }) => {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    const handleClose = () => {
        setDialog(false);
    };

    return (
        <MuiDialog
            fullScreen={fullScreen}
            open={true}
            onClose={handleClose}
            aria-labelledby="responsive-dialog-title"
        >
            <DialogTitle id="responsive-dialog-title">
                {"Create a New Circle"}
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Fill in the details to create a new circle.
                </DialogContentText>
                {/* You can add more form fields here */}
            </DialogContent>
            <DialogActions>
                <Button autoFocus onClick={handleClose}>
                    Cancel
                </Button>
                <Button onClick={handleClose} autoFocus>
                    Create
                </Button>
            </DialogActions>
        </MuiDialog>
    );
};

export default CreateClassDialog;