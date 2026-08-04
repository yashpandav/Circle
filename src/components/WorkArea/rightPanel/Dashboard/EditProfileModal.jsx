import React, { useState, useRef } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Avatar,
    IconButton,
    CircularProgress,
    MenuItem,
    Select,
    FormControl,
    InputLabel
} from "@mui/material";
import {
    PhotoCamera as PhotoCameraIcon,
    Close as CloseIcon,
    Person as PersonIcon,
    Email as EmailIcon,
    InfoOutlined as InfoIcon,
    CalendarMonth as CalendarIcon,
    Wc as WcIcon
} from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { updateUserProfile } from "../../../../Api/apiCaller/userapicaller";
import toast from "react-hot-toast";

export default function EditProfileModal({ open, onClose, user, onProfileUpdated }) {
    const dispatch = useDispatch();
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
        e.preventDefault();
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

    const userInitials = `${(firstName || user?.firstName || 'U')[0]}${(lastName || user?.lastName || 'P')[0]}`.toUpperCase();

    return (
        <Dialog
            open={open}
            onClose={!isSaving ? onClose : undefined}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: "16px",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
                    overflow: "hidden"
                }
            }}
        >
            <div className="edit-profile-dialog-header">
                <DialogTitle sx={{ m: 0, p: "20px 24px", fontWeight: 700, fontSize: "1.25rem", color: "#1e293b" }}>
                    Edit Profile
                </DialogTitle>
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    disabled={isSaving}
                    sx={{
                        position: "absolute",
                        right: 16,
                        top: 16,
                        color: "#94a3b8"
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </div>

            <form onSubmit={handleSubmit}>
                <DialogContent sx={{ p: "16px 28px 24px", display: "flex", flexDirection: "column", gap: "20px" }}>
                    {/* Avatar Upload Section */}
                    <div className="edit-profile-avatar-section">
                        <div className="avatar-preview-wrap">
                            <Avatar
                                src={imagePreview}
                                alt="User Avatar"
                                sx={{
                                    width: 88,
                                    height: 88,
                                    bgcolor: "#00a896",
                                    fontSize: "2rem",
                                    fontWeight: 700,
                                    boxShadow: "0 4px 12px rgba(0, 168, 150, 0.25)"
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
                            <button
                                type="button"
                                className="avatar-camera-btn"
                                onClick={() => fileInputRef.current?.click()}
                                title="Upload new photo"
                            >
                                <PhotoCameraIcon fontSize="small" />
                            </button>
                        </div>
                        <div className="avatar-info-text">
                            <span className="avatar-title">Profile Photo</span>
                            <span className="avatar-subtitle">PNG, JPG, or GIF up to 5MB</span>
                        </div>
                    </div>

                    {/* Name Fields */}
                    <div className="edit-profile-grid-2">
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
                    </div>

                    {/* Email (Read only) */}
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
                    <div className="edit-profile-grid-2">
                        <FormControl fullWidth size="small">
                            <InputLabel id="gender-select-label">Gender</InputLabel>
                            <Select
                                labelId="gender-select-label"
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
                    </div>

                    {/* About / Bio */}
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
                </DialogContent>

                <DialogActions sx={{ p: "16px 28px", bgcolor: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
                    <Button
                        onClick={onClose}
                        disabled={isSaving}
                        sx={{
                            color: "#64748b",
                            textTransform: "none",
                            fontWeight: 600,
                            borderRadius: "8px"
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isSaving}
                        sx={{
                            bgcolor: "#00a896",
                            "&:hover": { bgcolor: "#008f80" },
                            textTransform: "none",
                            fontWeight: 600,
                            borderRadius: "8px",
                            px: 3
                        }}
                    >
                        {isSaving ? <CircularProgress size={22} color="inherit" /> : "Save Changes"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
