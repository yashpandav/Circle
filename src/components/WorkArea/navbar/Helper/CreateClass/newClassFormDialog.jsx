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
import { createClass } from "../../../../../Api/apiCaller/classapicaller";
import { joinedClass } from "../../../../../Api/apiCaller/userapicaller";
import "./newClassFormDialog.css";

const NewClassFormDialog = ({ open, handleClose }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);

    const onSubmit = async (data) => {
        setLoading(true);
        console.log(data);
        try{
            const success = await createClass({data});
            if (success) {
                await dispatch(joinedClass({dispatch}));
                handleClose();
            }
        }catch(err){
            console.log(err);
            console.log("SOMETHING WENT WRONG WHILE SENDING API FUNCTION");
        }
        setLoading(false);
    };

    return (
        <MuiDialog
            open={open}
            onClose={() => { }}
            aria-labelledby="form-dialog-title"
            className="custom-dialog"
        >
            <DialogTitle id="form-dialog-title" className="custom-dialog-title">
                Create New Class
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    <DialogContentText className="custom-dialog-content">
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
                    <div className="side-by-side">
                        <TextField
                            {...register("color")}
                            margin="normal"
                            id="color"
                            label="Circle Theme"
                            fullWidth
                            type="color"
                            variant="outlined"
                            style={{ height: '56px' }}
                        />
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
                <DialogActions style={{ padding: '20px', justifyContent: 'space-between' }}>
                    <Button onClick={handleClose} variant='outlined' style={{ color: '#d81159', borderColor: '#d81159', fontWeight: 'bold' }} disabled={loading}>
                        Cancel
                    </Button>
                    <Button type="submit" variant='contained' style={{ backgroundColor: '#00a896', color: 'white', fontWeight: 'bold' }} disabled={loading}>
                        {loading ? <CircularProgress size={24} style={{color: 'white'}} /> : "Create"}
                    </Button>
                </DialogActions>
            </form>
        </MuiDialog>
    );
};

export default NewClassFormDialog;
