const fs = require('fs');
const { Pool } = require('pg');
const csv = require('csv-parser');

// PostgreSQL Database Configuration
const pool = new Pool({
  user: 'postgres',        // Replace with your PostgreSQL username
  host: 'localhost',            // Replace with your database host
  database: 'task_manager1',     // Replace with your database name
  password: '1606',    // Replace with your PostgreSQL password
  port: 5432,                   // Default PostgreSQL port
});

// CSV File Path
const CSV_FILE_PATH = './data.csv';

// Function to Insert Data into PostgreSQL
const insertDataFromCSV = async () => {
  const client = await pool.connect(); // Connect to PostgreSQL
  try {
    console.log('Connected to the database.');
    const rows = [];

    // Read and parse the CSV file
    fs.createReadStream(CSV_FILE_PATH)
      .pipe(csv())
      .on('data', (row) => {
        rows.push(row); // Add each row to the array
      })
      .on('end', async () => {
        console.log(`Read ${rows.length} rows from CSV file.`);

        // Insert rows into PostgreSQL
        for (let row of rows) {
          const {
            Title,
            Description,
            Assignees,
            'Due Date': DueDate,
            Priority,
            Status,
            Tags,
            'Created Date': CreatedDate,
            Dependencies,
          } = row;

          const query = `
            INSERT INTO action_items 
            (title, description, assignees, due_date, priority, status, tags, created_date, dependencies)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          `;

          const values = [
            Title,
            Description,
            Assignees,
            DueDate,
            Priority,
            Status,
            Tags,
            CreatedDate,
            Dependencies,
          ];

          try {
            await client.query(query, values); // Insert row
            console.log('Inserted:', values);
          } catch (err) {
            console.error('Error inserting row:', values, err.message);
          }
        }

        console.log('Data insertion complete.');
        client.release();
        process.exit();
      });
  } catch (err) {
    console.error('Error:', err.message);
    client.release();
    process.exit(1);
  }
};

// Run the Function
insertDataFromCSV();
