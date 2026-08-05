import React, { useState, useRef } from "react";
import MuiDialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { useDispatch } from "react-redux";
import { updateUserProfile } from "../../../../Api/apiCaller/userapicaller";
import toast from "react-hot-toast";

export default function EditProfileModal({ open, onClose, user, onProfileUpdated }) {
    const dispatch = useDispatch();
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
    const fileInputRef = useRef(null);

    const [firstName, setFirstName] = useState(user?.firstName || "");
    const [lastName, setLastName] = useState(user?.lastName || "");
    const [about, setAbout] = useState(user?.additionalDetails?.about || "");
    const [gender, setGender] = useState(user?.additionalDetails?.gender || "");
    const [dob, setDob] = useState(user?.additionalDetails?.dob || "");
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(user?.image || "");
    const [isSaving, setIsSaving] = useState(false);

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Image size should be less than 5MB");
                return;
            }
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        if (e && e.preventDefault) {
            e.preventDefault();
        }
        if (!firstName.trim() || !lastName.trim()) {
            toast.error("First name and last name are required");
            return;
        }

        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append("firstName", firstName.trim());
            formData.append("lastName", lastName.trim());
            formData.append("about", about.trim());
            formData.append("gender", gender);
            formData.append("dob", dob);
            if (imageFile) {
                formData.append("image", imageFile);
            }

            const res = await updateUserProfile(formData, dispatch);
            toast.success(res?.message || "Profile updated successfully!");
            if (onProfileUpdated) {
                onProfileUpdated();
            }
            onClose();
        } catch (err) {
            console.error("Profile update error:", err);
            toast.error(err?.message || "Failed to update profile. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const userInitials = `${(firstName || user?.firstName || "U")[0]}${(lastName || user?.lastName || "P")[0]}`.toUpperCase();

    return (
        <MuiDialog
            fullScreen={fullScreen}
            open={open}
            onClose={!isSaving ? onClose : undefined}
            maxWidth="sm"
            fullWidth
            className="global-dialog"
        >
            <DialogTitle className="global-dialog-title" style={{ backgroundColor: "#00a896" }}>
                Edit Profile
            </DialogTitle>

            <form onSubmit={handleSubmit}>
                <DialogContent className="global-dialog-content" style={{ padding: "24px 28px" }}>
                    <Box display="flex" flexDirection="column" gap={2.5}>
                        {/* Avatar Picker */}
                        <Box display="flex" alignItems="center" gap={2.5} sx={{ mb: 1 }}>
                            <Box position="relative" sx={{ display: "inline-block" }}>
                                <Avatar
                                    src={imagePreview}
                                    alt="User Avatar"
                                    sx={{
                                        width: 76,
                                        height: 76,
                                        bgcolor: "#00a896",
                                        fontSize: "1.75rem",
                                        fontWeight: 700,
                                        border: "3px solid #e2e8f0"
                                    }}
                                >
                                    {userInitials}
                                </Avatar>
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                    style={{ display: "none" }}
                                />
                                <Button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    sx={{
                                        position: "absolute",
                                        bottom: -4,
                                        right: -4,
                                        minWidth: 32,
                                        width: 32,
                                        height: 32,
                                        borderRadius: "50%",
                                        p: 0,
                                        bgcolor: "#00a896",
                                        color: "#ffffff",
                                        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                                        "&:hover": { bgcolor: "#008f80" }
                                    }}
                                    title="Upload photo"
                                >
                                    <PhotoCameraIcon sx={{ fontSize: 18 }} />
                                </Button>
                            </Box>
                            <Box>
                                <p style={{ margin: "0 0 4px", fontWeight: 600, color: "#1e293b", fontSize: "0.95rem" }}>
                                    Profile Picture
                                </p>
                                <p style={{ margin: 0, color: "#64748b", fontSize: "0.82rem" }}>
                                    JPG, PNG, or GIF up to 5MB
                                </p>
                            </Box>
                        </Box>

                        {/* Name Inputs */}
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="First Name"
                                    variant="outlined"
                                    fullWidth
                                    size="small"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                    disabled={isSaving}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Last Name"
                                    variant="outlined"
                                    fullWidth
                                    size="small"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required
                                    disabled={isSaving}
                                />
                            </Grid>
                        </Grid>

                        {/* Email Read-only */}
                        <TextField
                            label="Email Address"
                            variant="outlined"
                            fullWidth
                            size="small"
                            value={user?.email || ""}
                            disabled
                            helperText="Email cannot be changed directly"
                        />

                        {/* Gender & DOB */}
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth size="small">
                                    <InputLabel id="edit-gender-label">Gender</InputLabel>
                                    <Select
                                        labelId="edit-gender-label"
                                        label="Gender"
                                        value={gender}
                                        onChange={(e) => setGender(e.target.value)}
                                        disabled={isSaving}
                                    >
                                        <MenuItem value=""><em>Not Specified</em></MenuItem>
                                        <MenuItem value="Male">Male</MenuItem>
                                        <MenuItem value="Female">Female</MenuItem>
                                        <MenuItem value="Other">Other</MenuItem>
                                        <MenuItem value="Prefer not to say">Prefer not to say</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Date of Birth"
                                    type="date"
                                    variant="outlined"
                                    fullWidth
                                    size="small"
                                    value={dob}
                                    onChange={(e) => setDob(e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    disabled={isSaving}
                                />
                            </Grid>
                        </Grid>

                        {/* Biography */}
                        <TextField
                            label="About / Bio"
                            placeholder="Tell your classmates and teachers a bit about yourself..."
                            multiline
                            rows={3}
                            variant="outlined"
                            fullWidth
                            value={about}
                            onChange={(e) => setAbout(e.target.value)}
                            disabled={isSaving}
                        />
                    </Box>
                </DialogContent>

                <DialogActions className="global-dialog-actions">
                    <Button
                        variant="outlined"
                        className="global-dialog-btn-cancel"
                        onClick={onClose}
                        disabled={isSaving}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        className="global-dialog-btn-submit"
                        style={{ backgroundColor: "#00a896" }}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <Box display="flex" alignItems="center" gap={1}>
                                <CircularProgress size={16} color="inherit" />
                                <span>Saving...</span>
                            </Box>
                        ) : (
                            "Save Changes"
                        )}
                    </Button>
                </DialogActions>
            </form>
        </MuiDialog>
    );
}
