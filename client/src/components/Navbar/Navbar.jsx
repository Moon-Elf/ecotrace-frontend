// src/components/Navbar/Navbar.jsx
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Button, Typography, Box } from '@mui/material';

const Navbar = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          EcoTrace
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button color="inherit" component={Link} to="/harvest">
            Harvest
          </Button>
          <Button color="inherit" component={Link} to="/manufacturing">
            Manufacturing
          </Button>
          <Button color="inherit" component={Link} to="/transportation">
            Transportation
          </Button>
          <Button color="inherit" component={Link} to="/consumer">
            Consumer
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
