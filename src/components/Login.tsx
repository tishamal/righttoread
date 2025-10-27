import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  Link,
  InputAdornment,
  IconButton,
  Avatar,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const LoginContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#f5f7fa',
  padding: theme.spacing(2),
}));

const LoginCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  minWidth: '400px',
  maxWidth: '450px',
  width: '100%',
}));

const IllustrationContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: theme.spacing(4),
  height: '280px',
}));

const MainAvatar = styled(Avatar)(({ theme }) => ({
  width: '200px',
  height: '200px',
  backgroundColor: '#b794f6',
  position: 'relative',
  zIndex: 2,
}));

const FloatingElement = styled(Box)(({ theme }) => ({
  position: 'absolute',
  borderRadius: '50%',
  zIndex: 1,
}));

const BrandContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(3),
  left: theme.spacing(3),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const BrandIcon = styled(Box)(({ theme }) => ({
  width: '32px',
  height: '32px',
  backgroundColor: '#1976d2',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontSize: '18px',
  fontWeight: 'bold',
}));

interface LoginProps {
  onLogin: (email: string, password: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      onLogin(email, password);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <LoginContainer>
      {/* Brand Logo */}
      <BrandContainer>
        <BrandIcon>R</BrandIcon>
        <Typography variant="h6" fontWeight="bold" color="text.primary">
          RightToRead
        </Typography>
      </BrandContainer>

      <Container maxWidth="sm">
        <Box display="flex" alignItems="center" gap={6}>
          {/* Left Side - Illustration */}
          <Box flex={1} display={{ xs: 'none', md: 'block' }}>
            <IllustrationContainer>
              {/* Floating decorative elements */}
              <FloatingElement
                sx={{
                  width: '20px',
                  height: '20px',
                  backgroundColor: '#ff6b6b',
                  top: '20px',
                  left: '40px',
                }}
              />
              <FloatingElement
                sx={{
                  width: '16px',
                  height: '16px',
                  backgroundColor: '#4ecdc4',
                  top: '60px',
                  right: '30px',
                }}
              />
              <FloatingElement
                sx={{
                  width: '24px',
                  height: '24px',
                  backgroundColor: '#45b7d1',
                  bottom: '40px',
                  left: '20px',
                }}
              />
              <FloatingElement
                sx={{
                  width: '18px',
                  height: '18px',
                  backgroundColor: '#f9ca24',
                  bottom: '80px',
                  right: '50px',
                }}
              />
              <FloatingElement
                sx={{
                  width: '14px',
                  height: '14px',
                  backgroundColor: '#6c5ce7',
                  top: '120px',
                  left: '10px',
                }}
              />

              {/* Main Avatar */}
              <MainAvatar>
                <img
                  src="https://images.unsplash.com/photo-1494790108755-2616b612b098?w=200&h=200&fit=crop&crop=face"
                  alt="User Avatar"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '50%',
                  }}
                />
              </MainAvatar>

              {/* Small decorative avatars */}
              <Avatar
                sx={{
                  width: '60px',
                  height: '60px',
                  position: 'absolute',
                  bottom: '20px',
                  left: '60px',
                  zIndex: 3,
                  border: '3px solid white',
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face"
                  alt="Small Avatar"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '50%',
                  }}
                />
              </Avatar>

              {/* Chat bubble */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: '140px',
                  left: '30px',
                  backgroundColor: '#4ecdc4',
                  borderRadius: '12px',
                  padding: '8px 12px',
                  color: 'white',
                  fontSize: '12px',
                  zIndex: 3,
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: '-8px',
                    left: '16px',
                    width: 0,
                    height: 0,
                    borderLeft: '8px solid transparent',
                    borderRight: '8px solid transparent',
                    borderTop: '8px solid #4ecdc4',
                  },
                }}
              >
                ••• 
              </Box>
            </IllustrationContainer>
          </Box>

          {/* Right Side - Login Form */}
          <Box flex={1}>
            <LoginCard>
              <Box textAlign="center" mb={4}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  Welcome back
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Log in your account
                </Typography>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => onLogin('demo@example.com', 'demo123')}
                  sx={{ mt: 1 }}
                >
                  Skip Login (Demo Mode)
                </Button>
              </Box>

              <form onSubmit={handleSubmit}>
                <Box mb={3}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="What is your e-mail?"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#f8f9fa',
                        borderRadius: '12px',
                      },
                    }}
                  />
                </Box>

                <Box mb={3}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={togglePasswordVisibility}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#f8f9fa',
                        borderRadius: '12px',
                      },
                    }}
                  />
                </Box>

                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        color="primary"
                        size="small"
                      />
                    }
                    label={
                      <Typography variant="body2">
                        Remember me
                      </Typography>
                    }
                  />
                  <Link
                    href="#"
                    variant="body2"
                    color="primary"
                    sx={{ textDecoration: 'none' }}
                  >
                    Forgot password?
                  </Link>
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{
                    py: 1.5,
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontSize: '16px',
                    fontWeight: 'medium',
                    backgroundColor: '#6366f1',
                    '&:hover': {
                      backgroundColor: '#5b5ad6',
                    },
                  }}
                >
                  Continue
                </Button>

                <Box textAlign="center" mt={3}>
                  <Typography variant="body2" color="text.secondary">
                    Don't have an account?{' '}
                    <Link
                      href="#"
                      color="primary"
                      sx={{ textDecoration: 'none', fontWeight: 'medium' }}
                    >
                      Sign up
                    </Link>
                  </Typography>
                </Box>
              </form>
            </LoginCard>
          </Box>
        </Box>
      </Container>
    </LoginContainer>
  );
};

export default Login;
