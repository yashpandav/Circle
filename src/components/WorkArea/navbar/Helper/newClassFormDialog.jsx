import React from "react";
import { useForm } from "react-hook-form";
import Button from "@mui/material/Button";
import MuiDialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import { createClass } from "../../../../Api/apiCaller/classapicaller";
import "./newClassFormDialog.css";

const NewClassFormDialog = ({ open, handleClose }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data) => {
        console.log(data);
        try{
            await createClass({data});
        }catch(err){
            console.log(err);
            console.log("SOMETHING WENT WRONG WHILE SENDING API FUNCTION");
        }
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
                        {...register("name", { required: true })}
                        margin="dense"
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
                        margin="dense"
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
                        margin="dense"
                        id="subject"
                        label="Subject"
                        type="text"
                        fullWidth
                        variant="outlined"
                    />
                    <div className="side-by-side">
                        <TextField
                            {...register("color")}
                            margin="dense"
                            id="color"
                            label="Circle Theme"
                            fullWidth
                            type="color"
                            variant="outlined"
                        />
                        <TextField
                            {...register("banner")}
                            margin="dense"
                            id="banner"
                            label="Banner"
                            type="file"
                            fullWidth
                            variant="outlined"
                        />
                    </div>
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
