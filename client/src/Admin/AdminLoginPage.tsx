import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Paper, Typography, Box, Alert } from '@mui/material';
import { login, getCurrentUser } from '../services/auth.api';
import { useSnackbar } from 'notistack';
import COLORS from '../../assets/colors';
import styled from 'styled-components';

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
`;

const LoginPaper = styled(Paper)`
  padding: 3rem;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
`;

const StyledButton = styled(Button)`
  margin-top: 1.5rem;
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
`;

function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    // Check if already logged in
    getCurrentUser().then((user) => {
      if (user?.admin) {
        navigate('/admin', { replace: true });
      }
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.admin) {
        enqueueSnackbar('Login successful', { variant: 'success' });
        navigate('/admin', { replace: true });
      } else {
        setError('You do not have admin access');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LoginPaper>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 3 }}>
          Admin Login
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            autoComplete="email"
            autoFocus
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            autoComplete="current-password"
          />
          <StyledButton
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              bgcolor: COLORS.gogo_blue,
              '&:hover': { bgcolor: '#0066cc' },
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </StyledButton>
        </form>
      </LoginPaper>
    </LoginContainer>
  );
}

export default AdminLoginPage;







