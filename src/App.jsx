import React from 'react';
import DataGrid from "./components/Datagrid.jsx";
import DataGridtwo from "./components/Datagridtwo.jsx";


const App = () => {
  // Define sample data
  const data = [
    { id: 1, name: 'John Doe', age: 25, city: 'New York', role: 'Developer', joinDate: '2024-01-15', salary: 75000, ac:895623, av:895623 },
    { id: 2, name: 'Jane Smith', age: 30, city: 'London', role: 'Designer', joinDate: '2023-11-20', salary: 65000, ac:895623, av:895623 },
    { id: 3, name: 'Bob Johnson', age: 35, city: 'Paris', role: 'Manager', joinDate: '2023-08-10', salary: 85000, ac:895623, av:895623 },
    { id: 4, name: 'Alice Brown', age: 28, city: 'Tokyo', role: 'Developer', joinDate: '2024-02-01', salary: 72000, ac:895623, av:895623 },
    { id: 5, name: 'Charlie Wilson', age: 32, city: 'London', role: 'Designer', joinDate: '2023-12-15', salary: 68000, ac:895623, av:895623 }
  ];

  // Define column configuration
  const columns = [
    { key: 'name', label: 'Name', sortable: true, filterType: 'text', width: 200 },
    { key: 'age', label: 'Age', sortable: true, filterType: 'number', width: 100 },
    { key: 'city', label: 'City', sortable: true, filterType: 'select', width: 150, options: [...new Set(data.map(item => item.city))] },
    { key: 'role', label: 'Role', sortable: true, filterType: 'select', width: 150, options: [...new Set(data.map(item => item.role))] },
    { key: 'joinDate', label: 'Join Date', sortable: true, filterType: 'date', width: 150 },
    { key: 'ac', label: 'AC', sortable: true, filterType: 'number', width: 150 },
    { key: 'av', label: 'AV', sortable: true, filterType: 'number', width: 150 },
    { key: 'salary', label: 'Salary', sortable: true, filterType: 'number-range', width: 150 },
    { key: 'view', label: 'View', sortable: false, filterType: 'none', width: 150 },
  ];

  return (
      <div className="app-container p-4">
        <h1 className="text-xl font-bold mb-4">Custom DataGrid Example</h1>
        <DataGrid data={data} columns={columns} />

      </div>
  );
};

export default App;
