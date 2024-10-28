import React, { useState, useMemo, useRef } from 'react';
import { ChevronUp, ChevronDown, Search, Download, ArrowLeft, ArrowRight } from 'lucide-react';

const DataGridtwo = () => {
    // Sample data
    const initialData = [
        { id: 1, name: 'John Doe', age: 25, city: 'New York', role: 'Developer', joinDate: '2024-01-15', salary: 75000 },
        { id: 2, name: 'Jane Smith', age: 30, city: 'London', role: 'Designer', joinDate: '2023-11-20', salary: 65000 },
        { id: 3, name: 'Bob Johnson', age: 35, city: 'Paris', role: 'Manager', joinDate: '2023-08-10', salary: 85000 },
        { id: 4, name: 'Alice Brown', age: 28, city: 'Tokyo', role: 'Developer', joinDate: '2024-02-01', salary: 72000 },
        { id: 5, name: 'Charlie Wilson', age: 32, city: 'London', role: 'Designer', joinDate: '2023-12-15', salary: 68000 },
        { id: 6, name: 'Charlie Wilson', age: 32, city: 'London', role: 'Designer', joinDate: '2023-12-15', salary: 68000 }
    ];

    const [data] = useState(initialData);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [filters, setFilters] = useState({});
    const [globalFilter, setGlobalFilter] = useState('');
    const [columnOrder, setColumnOrder] = useState([]);
    const [columnWidths, setColumnWidths] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [draggedColumn, setDraggedColumn] = useState(null);

    const resizingRef = useRef(null);
    const startXRef = useRef(null);
    const startWidthRef = useRef(null);

    // Sorting handler
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Filter handler
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const columns = [
        {
            key: 'name',
            label: 'Name',
            sortable: true,
            filterType: 'text',
            width: columnWidths.name || 200
        },
        {
            key: 'age',
            label: 'Age',
            sortable: true,
            filterType: 'number',
            width: columnWidths.age || 100
        },
        {
            key: 'city',
            label: 'City',
            sortable: true,
            filterType: 'select',
            options: [...new Set(data.map(item => item.city))],
            width: columnWidths.city || 150
        },
        {
            key: 'role',
            label: 'Role',
            sortable: true,
            filterType: 'select',
            options: [...new Set(data.map(item => item.role))],
            width: columnWidths.role || 150
        },
        {
            key: 'joinDate',
            label: 'Join Date',
            sortable: true,
            filterType: 'date',
            width: columnWidths.joinDate || 150
        },
        {
            key: 'salary',
            label: 'Salary',
            sortable: true,
            filterType: 'number-range',
            width: columnWidths.salary || 150
        }
    ];

    // Resizing handlers
    const handleResizeStart = (e, column) => {
        startXRef.current = e.pageX;
        startWidthRef.current = columnWidths[column.key] || column.width;
        resizingRef.current = column.key;
        document.addEventListener('mousemove', handleResizeMove);
        document.addEventListener('mouseup', handleResizeEnd);
    };

    const handleResizeMove = (e) => {
        if (!resizingRef.current) return;
        const diff = e.pageX - startXRef.current;
        const newWidth = Math.max(100, startWidthRef.current + diff);
        setColumnWidths(prev => ({
            ...prev,
            [resizingRef.current]: newWidth
        }));
    };

    const handleResizeEnd = () => {
        resizingRef.current = null;
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
    };

    // Filter rendering
    const renderFilter = (column) => {
        switch (column.filterType) {
            case 'select':
                return (
                    <select
                        value={filters[column.key] || ''}
                        onChange={(e) => handleFilterChange(column.key, e.target.value)}
                        className="w-full p-1 text-sm border rounded"
                    >
                        <option value="">All</option>
                        {column.options.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                );

            case 'date':
                return (
                    <input
                        type="date"
                        value={filters[column.key] || ''}
                        onChange={(e) => handleFilterChange(column.key, e.target.value)}
                        className="w-full p-1 text-sm border rounded"
                    />
                );

            case 'number-range':
                return (
                    <div className="flex gap-1">
                        <input
                            type="number"
                            placeholder="Min"
                            value={filters[`${column.key}_min`] || ''}
                            onChange={(e) => handleFilterChange(`${column.key}_min`, e.target.value)}
                            className="w-1/2 p-1 text-sm border rounded"
                        />
                        <input
                            type="number"
                            placeholder="Max"
                            value={filters[`${column.key}_max`] || ''}
                            onChange={(e) => handleFilterChange(`${column.key}_max`, e.target.value)}
                            className="w-1/2 p-1 text-sm border rounded"
                        />
                    </div>
                );

            default:
                return (
                    <input
                        type="text"
                        placeholder={`Filter ${column.label.toLowerCase()}...`}
                        value={filters[column.key] || ''}
                        onChange={(e) => handleFilterChange(column.key, e.target.value)}
                        className="w-full p-1 text-sm border rounded"
                    />
                );
        }
    };

    // Process data with filters, sorting, and pagination
    const processedData = useMemo(() => {
        let processed = [...data];

        if (globalFilter) {
            processed = processed.filter(item =>
                Object.values(item).some(value =>
                    String(value).toLowerCase().includes(globalFilter.toLowerCase())
                )
            );
        }

        Object.keys(filters).forEach(key => {
            if (filters[key]) {
                if (key.endsWith('_min')) {
                    const baseKey = key.replace('_min', '');
                    processed = processed.filter(item =>
                        Number(item[baseKey]) >= Number(filters[key])
                    );
                } else if (key.endsWith('_max')) {
                    const baseKey = key.replace('_max', '');
                    processed = processed.filter(item =>
                        Number(item[baseKey]) <= Number(filters[key])
                    );
                } else {
                    processed = processed.filter(item =>
                        String(item[key]).toLowerCase().includes(filters[key].toLowerCase())
                    );
                }
            }
        });

        if (sortConfig.key) {
            processed.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        return processed;
    }, [data, sortConfig, filters, globalFilter]);

    const totalPages = Math.ceil(processedData.length / pageSize);
    const paginatedData = processedData.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    // Export to CSV
    const exportToCSV = () => {
        const headers = columns.map(col => col.label).join(',');
        const rows = processedData.map(row =>
            columns.map(col => `"${row[col.key]}"`).join(',')
        );
        const csv = [headers, ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'export.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="w-full max-w-6xl mx-auto p-4">
            <div className="mb-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-1">
                    <Search className="text-gray-500" size={20} />
                    <input
                        type="text"
                        placeholder="Search all columns..."
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className="w-full p-2 border rounded"
                    />
                </div>
                <button
                    onClick={exportToCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    <Download size={20} />
                    Export CSV
                </button>
            </div>

            <div className="overflow-x-auto border rounded">
                <table className="w-full border-collapse">
                    <thead>
                    <tr className="bg-gray-50">
                        {columns.map(column => (
                            <th
                                key={column.key}
                                className="border p-2 relative"
                                style={{ width: column.width }}
                            >
                                <div className="flex flex-col gap-2">
                                    <div
                                        className="flex items-center justify-between cursor-pointer"
                                        onClick={() => column.sortable && handleSort(column.key)}
                                    >
                                        <span>{column.label}</span>
                                        {column.sortable && (
                                            <div className="flex flex-col">
                                                <ChevronUp
                                                    size={12}
                                                    className={sortConfig.key === column.key && sortConfig.direction === 'asc'
                                                        ? 'text-blue-600'
                                                        : 'text-gray-400'
                                                    }
                                                />
                                                <ChevronDown
                                                    size={12}
                                                    className={sortConfig.key === column.key && sortConfig.direction === 'desc'
                                                        ? 'text-blue-600'
                                                        : 'text-gray-400'
                                                    }
                                                />
                                            </div>
                                        )}
                                    </div>
                                    {renderFilter(column)}
                                </div>
                                <div
                                    className="absolute top-0 right-0 h-full w-1 cursor-col-resize bg-gray-300 opacity-0 hover:opacity-100"
                                    onMouseDown={(e) => handleResizeStart(e, column)}
                                />
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {paginatedData.map((row) => (
                        <tr key={row.id} className="hover:bg-gray-50">
                            {columns.map(column => (
                                <td
                                    key={column.key}
                                    className="border p-2"
                                    style={{ width: column.width }}
                                >
                                    {row[column.key]}
                                </td>
                            ))}
                        </tr>
                    ))}



                    </tbody>
                </table>
            </div>

            <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, processedData.length)} of {processedData.length} results
                </div>
                <div className="flex items-center gap-2">
                    <select
                        value={pageSize}
                        onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                        className="p-1 border rounded"
                    >
                        <option value={5}>5 / page</option>
                        <option value={10}>10 / page</option>
                        <option value={20}>20 / page</option>
                        <option value={50}>50 / page</option>
                    </select>
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
                    >
                        <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DataGridtwo;