const express = require('express');
const mysql = require('mysql');
const axios = require('axios');

const app = express();
app.use(express.json());

// MySQL database configuration
const dbConfig = {
  host: 'localhost',
  user: 'your_username',
  password: 'your_password',
  database: 'your_database',
};

// Create a MySQL connection pool
const pool = mysql.createPool(dbConfig);

// FreshSales CRM API configuration
const freshSalesApiUrl = 'https://api.freshsales.io/api/contacts';
const freshSalesApiKey = 'efac0ef8be0935f88a0b48c40243a10e';

// Endpoint to create a new contact
app.post('/createContact', async (req, res) => {
  const { first_name, last_name, email, mobile_number, data_store } = req.body;

  try {
    if (data_store === 'CRM') {
      // Create contact in FreshSales CRM
      const response = await axios.post(
        freshSalesApiUrl,
        {
          first_name,
          last_name,
          email,
          mobile_number,
        },
        {
          headers: {
            'Authorization': `Token token=${freshSalesApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      // Return the created contact from CRM
      res.json(response.data);
    } else if (data_store === 'DATABASE') {
      // Create contact in MySQL database
      pool.query(
        'INSERT INTO contacts (first_name, last_name, email, mobile_number) VALUES (?, ?, ?, ?)',
        [first_name, last_name, email, mobile_number],
        (error, results) => {
          if (error) {
            throw error;
          }
          
          // Return the created contact ID from the database
          res.json({ contact_id: results.insertId });
        }
      );
    } else {
      // Invalid data_store value
      res.status(400).json({ error: 'Invalid data_store value' });
    }
  } catch (error) {
    // Error handling
    console.error('Error creating contact:', error);
    res.status(500).json({ error: 'An error occurred while creating the contact' });
  }
});

// Endpoint to retrieve a contact
app.post('/getContact', (req, res) => {
  const { contact_id, data_store } = req.body;

  try {
    if (data_store === 'CRM') {
      // Retrieve contact from FreshSales CRM
      axios.get(`${freshSalesApiUrl}/${contact_id}`, {
        headers: {
          'Authorization': `Token token=${freshSalesApiKey}`,
          'Content-Type': 'application/json',
        },
      })
        .then(response => {
          // Return the retrieved contact from CRM
          res.json(response.data);
        })
        .catch(error => {
          throw error;
        });
    } else if (data_store === 'DATABASE') {
      // Retrieve contact from MySQL database
      pool.query(
        'SELECT * FROM contacts WHERE id = ?',
        [contact_id],
        (error, results) => {
          if (error) {
            throw error;
          }
          
          if (results.length > 0) {
            // Return the retrieved contact from the database
            res.json(results[0]);
          } else {
            res.status(404).json({ error: 'Contact not found' });
          }
        }
      );
    } else {
      // Invalid data_store value
      res.status(400).json({ error: 'Invalid data_store value' });
    }
  } catch (error) {
    // Error handling
    console.error('Error retrieving contact:', error);
    res.status(500).json({ error: 'An error occurred while retrieving the contact' });
  }
});

// Endpoint to update a contact
app.post('/updateContact', (req, res) => {
  const { contact_id, new_email, new_mobile_number, data_store } = req.body;

  try {
    if (data_store === 'CRM') {
      // Update contact in FreshSales CRM
      axios.put(
        `${freshSalesApiUrl}/${contact_id}`,
        {
          email: new_email,
          mobile_number: new_mobile_number,
        },
        {
          headers: {
            'Authorization': `Token token=${freshSalesApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      )
        .then(response => {
          // Return the updated contact from CRM
          res.json(response.data);
        })
        .catch(error => {
          throw error;
        });
    } else if (data_store === 'DATABASE') {
      // Update contact in MySQL database
      pool.query(
        'UPDATE contacts SET email = ?, mobile_number = ? WHERE id = ?',
        [new_email, new_mobile_number, contact_id],
        (error, results) => {
          if (error) {
            throw error;
          }
          
          if (results.affectedRows > 0) {
            // Return the contact update status
            res.json({ success: true });
          } else {
            res.status(404).json({ error: 'Contact not found' });
          }
        }
      );
    } else {
      // Invalid data_store value
      res.status(400).json({ error: 'Invalid data_store value' });
    }
  } catch (error) {
    // Error handling
    console.error('Error updating contact:', error);
    res.status(500).json({ error: 'An error occurred while updating the contact' });
  }
});

// Endpoint to delete a contact
app.post('/deleteContact', (req, res) => {
  const { contact_id, data_store } = req.body;

  try {
    if (data_store === 'CRM') {
      // Delete contact from FreshSales CRM
      axios.delete(`${freshSalesApiUrl}/${contact_id}`, {
        headers: {
          'Authorization': `Token token=${freshSalesApiKey}`,
          'Content-Type': 'application/json',
        },
      })
        .then(() => {
          // Return the contact delete status
          res.json({ success: true });
        })
        .catch(error => {
          throw error;
        });
    } else if (data_store === 'DATABASE') {
      // Delete contact from MySQL database
      pool.query(
        'DELETE FROM contacts WHERE id = ?',
        [contact_id],
        (error, results) => {
          if (error) {
            throw error;
          }
          
          if (results.affectedRows > 0) {
            // Return the contact delete status
            res.json({ success: true });
          } else {
            res.status(404).json({ error: 'Contact not found' });
          }
        }
      );
    } else {
      // Invalid data_store value
      res.status(400).json({ error: 'Invalid data_store value' });
    }
  } catch (error) {
    // Error handling
    console.error('Error deleting contact:', error);
    res.status(500).json({ error: 'An error occurred while deleting the contact' });
  }
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
