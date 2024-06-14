import React, { useState } from 'react';
import Button from '@mui/material/Button';
import MuiDialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import NewClassFormDialog from './newClassFormDialog';
import './createClassDialog.css';

const CreateClassDialog = ({ setCreateDialog }) => {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    const [createClass, setCreateClass] = useState(false);

    const handleClose = () => {
        setCreateDialog(false);
    };

    const handleAgree = () => {
        setCreateClass(true);
    };

    const closeFinal = () => {
        setCreateDialog(false);
        setCreateClass(false);
    }

    return (
        <>
            <MuiDialog
                fullScreen={fullScreen}
                open={true}
                onClose={handleClose}
                aria-labelledby="responsive-dialog-title"
                className="custom-dialog"
            >
                <DialogTitle id="responsive-dialog-title" className="custom-dialog-title">
                    Create a New Circle
                </DialogTitle>
                <DialogContent>
                    <DialogContentText className="custom-dialog-content">
                        By creating a circle, you agree to the following terms and conditions:
                    </DialogContentText>
                    <DialogContentText className="custom-dialog-content">
                        1. <strong>Respectful Communication</strong>: All members are expected to communicate respectfully. Harassment, hate speech, and discrimination of any kind are strictly prohibited.
                    </DialogContentText>
                    <DialogContentText className="custom-dialog-content">
                        2. <strong>Privacy and Confidentiality</strong>: Members must respect the privacy and confidentiality of others. Personal information shared within the circle should not be disclosed outside the group.
                    </DialogContentText>
                    <DialogContentText className="custom-dialog-content">
                        3. <strong>Content Guidelines</strong>: All content shared within the circle must comply with community standards. Inappropriate content, including but not limited to, explicit, violent, or illegal material, is not allowed.
                    </DialogContentText>
                    <DialogContentText className="custom-dialog-content">
                        4. <strong>Active Participation</strong>: Members are encouraged to participate actively in discussions and activities. Inactive members may be removed from the circle at the discretion of the circle's creator.
                    </DialogContentText>
                    <DialogContentText className="custom-dialog-content">
                        5. <strong>Compliance with Laws</strong>: All members must comply with applicable local, state, national, and international laws and regulations.
                    </DialogContentText>
                    <DialogContentText className="custom-dialog-content">
                        Failure to adhere to these terms and conditions may result in removal from the circle and potential further action.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} variant='text'>
                        Disagree
                    </Button>
                    <Button onClick={handleAgree} variant='text'>
                        Agree
                    </Button>
                </DialogActions>
            </MuiDialog>
            <NewClassFormDialog
                open={createClass}
                handleClose={closeFinal}
            />
        </>
    );
};

export default CreateClassDialog;
