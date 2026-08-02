import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import Button from "@mui/material/Button";
import MuiDialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import CircularProgress from '@mui/material/CircularProgress';
import { Select, MenuItem, FormControl } from '@mui/material';
import { createClass } from "../../../../../Api/apiCaller/classapicaller";
import { joinedClass } from "../../../../../Api/apiCaller/userapicaller";
import ColorSelector from "../../../../Helper/colorSelector";

const NewClassFormDialog = ({ open, handleClose }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [selectedColor, setselectedColor] = useState('#4285f4');
    const [studentCanPost, setStudentCanPost] = useState(true);

    const onSubmit = async (data) => {
        setLoading(true);
        const submitData = { ...data, color: selectedColor, studentCanPost };
        try {
            const success = await createClass({ data: submitData });
            if (success) {
                await dispatch(joinedClass({ dispatch }));
                handleClose();
            }
        } catch (err) {
            // error already surfaced via toast in createClass
        }
        setLoading(false);
    };

    return (
        <MuiDialog
            open={open}
            onClose={() => { }}
            aria-labelledby="form-dialog-title"
            className="global-dialog"
        >
            <DialogTitle id="form-dialog-title" className="global-dialog-title">
                Create New Class
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    <DialogContentText className="global-dialog-content">
                        Please fill out the following details to create a new class.
                    </DialogContentText>
                    <TextField
                        {...register("name", { required: true })}
                        margin="normal"
                        id="name"
                        label="Circle Name"
                        type="text"
                        required={true}
                        fullWidth
                        variant="outlined"
                        error={!!errors.name}
                        helperText={errors.name ? "Circle Name is required" : ""}
                    />
                    <TextField
                        {...register("description", { required: true })}
                        margin="normal"
                        id="description"
                        label="Circle Description"
                        type="text"
                        fullWidth
                        required={true}
                        variant="outlined"
                        error={!!errors.description}
                        helperText={
                            errors.description ? "Circle Description is required" : ""
                        }
                    />
                    <TextField
                        {...register("subject")}
                        margin="normal"
                        id="subject"
                        label="Subject"
                        type="text"
                        fullWidth
                        variant="outlined"
                    />
                    <div style={{ marginTop: '16px', marginBottom: '8px' }}>
                        <p style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>Select Circle Theme:</p>
                        <ColorSelector setselectedColor={setselectedColor} selectedColor={selectedColor} />
                    </div>
                    <div style={{ marginTop: '16px', marginBottom: '8px' }}>
                        <p style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>Stream Settings:</p>
                        <FormControl fullWidth size="small">
                            <Select
                                value={studentCanPost}
                                onChange={(e) => setStudentCanPost(e.target.value)}
                            >
                                <MenuItem value={true}>Students can post information</MenuItem>
                                <MenuItem value={false}>Only teachers can post information</MenuItem>
                            </Select>
                        </FormControl>
                    </div>
                    <div style={{ marginTop: '8px' }}>
                        <TextField
                            {...register("banner")}
                            margin="normal"
                            id="banner"
                            type="file"
                            fullWidth
                            variant="outlined"
                        />
                    </div>
                </DialogContent>
                <DialogActions className="global-dialog-actions">
                    <Button onClick={handleClose} variant='outlined' className="global-dialog-btn-cancel" disabled={loading}>
                        Cancel
                    </Button>
                    <Button type="submit" variant='contained' className="global-dialog-btn-submit" disabled={loading}>
                        {loading ? <CircularProgress size={24} style={{ color: 'white' }} /> : "Create"}
                    </Button>
                </DialogActions>
            </form>
        </MuiDialog>
    );
};

export default NewClassFormDialog;
