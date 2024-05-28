import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Link, Toolbar, Typography, IconButton, TextField, InputAdornment } from '@mui/material';
import { TableSortLabel } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';

const Server_URL = process.env.REACT_APP_API_URL;

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const ManagerPage = () => {
  const [forms, setForms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortDirection, setSortDirection] = useState('des');
  const query = useQuery();
  const uidPrefix = query.get('uid');
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${Server_URL}/api/forms/${uidPrefix}`)
      .then(response => response.json())
      .then(data => {
        const sortedData = data.sort((a, b) => a.uid > b.uid ? 1 : -1);
        setForms(sortedData);
      })
      .catch(error => console.error('Error fetching forms:', error));
  }, [uidPrefix]);

  const handleSort = () => {
    const sortedForms = [...forms].sort((a, b) => {
      if (sortDirection === 'asc') {
        return a.uid > b.uid ? 1 : -1;
      } else {
        return a.uid < b.uid ? 1 : -1;
      }
    });
    setForms(sortedForms);
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  const handleAddForm = () => {
    navigate(`/admission-form?uid=${uidPrefix}&role=manager`);
  };

  return (
    <>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Manager's Forms
        </Typography>
      </Toolbar>
      <TableContainer component={Paper}>
        <Toolbar>
          <TextField
            label="Search"
            variant="outlined"
            size="small"
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Toolbar>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={true}
                  direction={sortDirection}
                  onClick={handleSort}
                >
                  uid
                </TableSortLabel>
              </TableCell>
              <TableCell>Full Name</TableCell>
              <TableCell align="center">Date of Identify</TableCell>
              <TableCell align="center">Category</TableCell>
              <TableCell align="center">Description</TableCell>
              <TableCell align="center">Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Map over the forms array and filter/search based on searchTerm */}
            {forms
              .filter((form) =>
                Object.values(form).some(
                  (value) =>
                    typeof value === 'string' &&
                    value.toLowerCase().includes(searchTerm.toLowerCase())
                )
              )
              .map((row) => (
                <TableRow key={row.uid}>
                  <TableCell component="th" scope="row">
                    {row.uid}
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {row.fullName}
                  </TableCell>
                  <TableCell align="center">{row.dateOfIdentify.toString().split('T')[0]}</TableCell>
                  <TableCell align="center">{row.category}</TableCell>
                  <TableCell align="center">{row.description}</TableCell>
                  <TableCell align="center">
                    <Link href={`/admission-form?uid=${row.uid}&role=manager`}>View Form</Link>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <Toolbar>
          <IconButton color="primary" aria-label="add new form" onClick={handleAddForm}>
            <AddIcon />
          </IconButton>
        </Toolbar>
      </TableContainer>
    </>
  );
};

export default ManagerPage;
