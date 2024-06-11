import React from "react";
import { useForm } from "react-hook-form";
import Button from "@mui/material/Button";
import MuiDialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import "./newClassFormDialog.css";

const NewClassFormDialog = ({ open, handleClose }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = (data) => {
        console.log(data);
        handleClose();
    };

    return (
        <MuiDialog
            open={open}
            onClose={handleClose}
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
                        {...register("className", { required: true })}
                        margin="dense"
                        id="className"
                        label="Class Name"
                        type="text"
                        fullWidth
                        variant="outlined"
                        error={!!errors.className}
                        helperText={errors.className ? "Class Name is required" : ""}
                    />
                    <TextField
                        {...register("classDescription", { required: true })}
                        margin="dense"
                        id="classDescription"
                        label="Class Description"
                        type="text"
                        fullWidth
                        variant="outlined"
                        error={!!errors.classDescription}
                        helperText={
                            errors.classDescription ? "Class Description is required" : ""
                        }
                    />
                    <TextField
                        {...register("subject", { required: true })}
                        margin="dense"
                        id="subject"
                        label="Subject"
                        type="text"
                        fullWidth
                        variant="outlined"
                        error={!!errors.subject}
                        helperText={errors.subject ? "Subject is required" : ""}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} className="custom-dialog-button">
                        Cancel
                    </Button>
                    <Button type="submit" className="custom-dialog-button">
                        Create
                    </Button>
                </DialogActions>
            </form>
        </MuiDialog>
    );
};

export default NewClassFormDialog;
