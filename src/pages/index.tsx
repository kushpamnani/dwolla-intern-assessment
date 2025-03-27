import Head from 'next/head';
import useSWR from 'swr';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Grid,
  Snackbar,
} from '@mui/material';
import { AddRounded } from '@mui/icons-material';
import { useState } from 'react';

export type Customer = {
  firstName: string;
  lastName: string;
  email: string;
  businessName?: string;
};

export type Customers = Customer[];

export type ApiError = {
  code: string;
  message: string;
};

const fetcher = async (url: string) => {
  const response = await fetch(url);
  const body = await response.json();
  if (!response.ok) throw body;
  return body;
};

const Home = () => {
  const { data, error, isLoading, mutate } = useSWR<Customers, ApiError>(
    '/api/customers',
    fetcher
  );

  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const isFormValid = firstName.trim() !== '' && lastName.trim() !== '' && email.trim() !== '';

  const handleAddCustomer = async () => {
    const newCustomer = {
      firstName,
      lastName,
      email,
      businessName: businessName || undefined,
    };

    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCustomer),
    });

    if (res.ok) {
      await mutate(); // Refresh list
      setFirstName('');
      setLastName('');
      setEmail('');
      setBusinessName('');
      setOpen(false);
      setSuccessMsg('Customer added successfully!');
    } else {
      const err = await res.json();
      alert(`Failed to add customer: ${err.message}`);
    }
  };

  return (
    <>
      <Head>
        <title>Dwolla | Customers</title>
      </Head>
      <main>
        <Box sx={{ padding: 4, backgroundColor: '#f5f6f8', minHeight: '100vh' }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mt: 6,
              px: 2,
            }}
          >
            <Box
              sx={{
                width: '100%',
                maxWidth: 900,
                backgroundColor: 'white',
                padding: 4,
                borderRadius: 2,
                boxShadow: 3,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">
                  {data ? `${data.length} Customers` : 'Customers'}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddRounded />}
                  onClick={() => setOpen(true)}
                  sx={{ boxShadow: 2 }}
                >
                  Add Customer
                </Button>
              </Box>

              {isLoading && <p>Loading...</p>}
              {error && <p>Error: {error.message}</p>}

              {data && (
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Name</strong></TableCell>
                      <TableCell><strong>Email</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.map((customer) => (
                      <TableRow key={customer.email}>
                        <TableCell>
                          {customer.firstName} {customer.lastName}
                        </TableCell>
                        <TableCell>{customer.email}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Box>
          </Box>

          {/* Add Customer Dialog */}
          <Dialog open={open} onClose={() => setOpen(false)}>
            <DialogTitle>Add Customer</DialogTitle>
            <DialogContent sx={{ pt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    placeholder="First Name *"
                    variant="outlined"
                    fullWidth
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    autoFocus
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    placeholder="Last Name *"
                    variant="outlined"
                    fullWidth
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    placeholder="Business Name"
                    variant="outlined"
                    fullWidth
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    placeholder="Email Address *"
                    variant="outlined"
                    fullWidth
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={() => setOpen(false)}>Cancel</Button>
              <Button
                variant="contained"
                onClick={handleAddCustomer}
                disabled={!isFormValid}
              >
                Create
              </Button>
            </DialogActions>
          </Dialog>

          {/* ✅ Success Snackbar */}
          <Snackbar
            open={!!successMsg}
            autoHideDuration={3000}
            onClose={() => setSuccessMsg('')}
            message={successMsg}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          />
        </Box>
      </main>
    </>
  );
};

export default Home;
