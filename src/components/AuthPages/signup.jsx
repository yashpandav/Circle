import React from 'react';
import { useState, useEffect } from 'react';
import { TextField, Button, IconButton, InputAdornment } from '@mui/material';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import GoogleIcon from '@mui/icons-material/Google';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import Divider from '@mui/material/Divider';
import './signup.css'

export default function SignUp() {
    const [showPassword, setShowPassword] = useState(false);
    const [showFinalPassword, setShowFinalPassword] = useState(false);

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleClickShowFinalPassword = () => {
        setShowFinalPassword(!showFinalPassword);
    };

    return (
        <div id='body'>
            <img src={require('../../Data/Images/5oob9hmb.png')} alt='signup-teacher-img' id='signup-teacher-img'></img>
            <div className='main-signup-form'>
                <div className='form-container'>
                    <h1>New Account?</h1>
                    <pre>Sign Up</pre>
                    <form id='signup-form'>
                        <div className='form-group'>
                            <PersonOutlineOutlinedIcon sx={{ color: 'action.active', mr: 1.5, mt: 2 }} />
                            <TextField type='text' label="Username" variant="standard" required fullWidth />
                        </div>
                        <div className='form-group'>
                            <PersonOutlineOutlinedIcon sx={{ color: 'action.active', mr: 1.5, mt: 2 }} />
                            <TextField type='text' label="Last Name" variant="standard" required fullWidth />
                        </div>
                        <div className='form-group'>
                            <EmailOutlinedIcon sx={{ color: 'action.active', mr: 1.5, mt: 2 }} />
                            <TextField type='email' label="Mail" variant="standard" required fullWidth />
                        </div>
                        <div className='form-group'>
                            <LockOutlinedIcon sx={{ color: 'action.active', mr: 1.5, mt: 2 }} />
                            <TextField
                                type={showPassword ? 'text' : 'password'}
                                label="Password"
                                variant="standard"
                                required
                                fullWidth
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={handleClickShowPassword}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOutlinedIcon /> : <VisibilityOffOutlinedIcon />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </div>
                        <div className='form-group'>
                            <LockOutlinedIcon sx={{ color: 'action.active', mr: 1.5, mt: 2 }} />
                            <TextField
                                type={showFinalPassword ? 'text' : 'password'}
                                label="Confirm Password"
                                variant="standard"
                                required
                                fullWidth
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle final password visibility"
                                                onClick={handleClickShowFinalPassword}
                                                edge="end"
                                            >
                                                {showFinalPassword ? <VisibilityOutlinedIcon /> : <VisibilityOffOutlinedIcon />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </div>
                        <Button variant="contained" className='register-btn'>
                            Register
                        </Button>
                    </form>
                    <Divider>or</Divider>
                    <Button variant="contained" className='register-btn'>
                        Register
                    </Button>
                </div>
                <svg width="67px" height="578px" viewBox="0 0 67 578" version="1.1" xmlns="http://www.w3.org/2000/svg">
                    <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                        <path d="M11.3847656,-5.68434189e-14 C-7.44726562,36.7213542 5.14322917,126.757812 49.15625,270.109375 C70.9827986,341.199016 54.8877465,443.829224 0.87109375,578 L67,578 L67,-5.68434189e-14 L11.3847656,-5.68434189e-14 Z" id="Path" fill="#F9BC35"></path>
                    </g>
                </svg>
                <div className="column" id="secondary">
                    <div className="sec-content">
                        <h2>Welcome Back!</h2>
                        <h3>Lorem ipsum dolor sit amet, consectetur adipiscing elit</h3>
                        <button type="button" className="btn btn-primary">Login</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
