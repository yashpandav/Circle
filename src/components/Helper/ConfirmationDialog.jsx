import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export default function ConfirmationDialog({ open, title, content, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel", confirmColor = "primary" }) {
    return (
        <Dialog 
            open={open} 
            onClose={onCancel}
            PaperProps={{
                style: {
                    borderRadius: '12px',
                    padding: '8px',
                    minWidth: '350px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                }
            }}
        >
            <DialogTitle sx={{ m: 0, p: 2, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" component="div" sx={{ fontWeight: 600, color: '#1f2937', fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' }}>
                    {title}
                </Typography>
                <IconButton
                    aria-label="close"
                    onClick={onCancel}
                    sx={{
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 2, pt: 0 }}>
                <Typography sx={{ color: '#4b5563', fontSize: '0.95rem', fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif', mt: 1 }}>
                    {content}
                </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 2, pt: 1 }}>
                <Button 
                    onClick={onCancel} 
                    sx={{
                        color: '#4b5563', 
                        textTransform: 'none', 
                        fontWeight: 500,
                        '&:hover': { backgroundColor: '#f3f4f6' }
                    }}
                >
                    {cancelText}
                </Button>
                <Button 
                    onClick={onConfirm} 
                    variant="contained" 
                    color={confirmColor}
                    sx={{
                        textTransform: 'none', 
                        fontWeight: 500,
                        boxShadow: 'none',
                        borderRadius: '6px',
                        px: 3,
                        ...(confirmColor === 'error' && {
                            backgroundColor: '#ef4444',
                            '&:hover': { backgroundColor: '#dc2626', boxShadow: 'none' }
                        }),
                        ...(confirmColor === 'primary' && {
                            backgroundColor: '#2563eb',
                            '&:hover': { backgroundColor: '#1d4ed8', boxShadow: 'none' }
                        })
                    }}
                >
                    {confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
