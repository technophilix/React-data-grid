import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown, Search, Download, ArrowLeft, ArrowRight, Pin, PinOff } from 'lucide-react';
import styled from 'styled-components';
import excelimage from "./../assets/excel-icon-12.png"
const DataGridtwo = ({ data: initialData, columns: initialColumns }) => {
    const [data] = useState(initialData);
    const [columns, setColumns] = useState(initialColumns);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [filters, setFilters] = useState({});
    const [globalFilter, setGlobalFilter] = useState('');
    const [columnWidths, setColumnWidths] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [pinnedColumns, setPinnedColumns] = useState([]);

    const resizingRef = useRef(null);
    const startXRef = useRef(null);
    const startWidthRef = useRef(null);
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
            case 'none':

                return (<></>);

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

    // Column pinning handler
    const handlePinColumn = (key) => {
        setPinnedColumns(prev => {
            if (prev.includes(key)) {
                return prev.filter(col => col !== key);
            }
            return [...prev, key];
        });
    };

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

    // Aggregations for numerical columns
    const aggregations = useMemo(() => {
        const result = {};
        columns.map((column, i) => {
            if(i===0 && column.filterType ==='text'){
                result[column.key] = 'Total'
            }else if ((column.filterType === 'number' || column.filterType==='number-range') && column.key !== 'year') {
                result[column.key] = data.reduce((acc, row) => acc + Number(row[column.key] || 0), 0);
            }
        });
        return result;
    }, [data, columns]);

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
        <div className="w-full max-w-6xl mx-auto p-4 datagrid-container">
            {/* Global Search and Export */}
            <div className="mb-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-1">
                    {/*<Search className="text-gray-500" size={20} />*/}
                    <input
                        type="text"
                        placeholder="Search all columns..."
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className="w-1/2 p-2 border rounded"
                    />
                </div>

                <img src={excelimage} alt={'excel'} className={'cursor-pointer'} onClick={exportToCSV} style={{
                    width: '30px',
                    height: '30px',
                }} />

            </div>

            {/* Data Grid */}
            <div className="overflow-x-auto border rounded">
                <table className="w-full table-fixed border-collapse">
                    {/* Table Header with Sticky Columns */}
                    <thead>
                    <tr className="bg-gray-50 sticky top-0 z-20">
                        {columns.map(column => (
                            <th
                                key={column.key}
                                className={`border p-2 relative ${pinnedColumns.includes(column.key) ? 'sticky left-0 bg-white z-10' : ''}`}
                                style={{ width: columnWidths[column.key] || column.width }}
                            >
                                <div className="flex flex-col gap-2">
                                    <div
                                        className="flex items-center justify-between cursor-pointer"

                                    >
                                        <span>{column.label}
                                            <button
                                                onClick={() => handlePinColumn(column.key)}
                                                className="text-xs p-3 underline"
                                            >
                                        {pinnedColumns.includes(column.key) ? <PinOff size={12}/> : <Pin size={12}/>}
                                    </button></span>
                                        {column.sortable && (
                                            <div className="flex flex-col" onClick={() => column.sortable && handleSort(column.key)}>
                                                <ChevronUp
                                                    size={12}
                                                    className={sortConfig.key === column.key && sortConfig.direction === 'asc' ? 'text-blue-600' : 'text-gray-400'}
                                                />
                                                <ChevronDown
                                                    size={12}
                                                    className={sortConfig.key === column.key && sortConfig.direction === 'desc' ? 'text-blue-600' : 'text-gray-400'}
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

                    {/* Table Body */}
                    <tbody>
                    {paginatedData.map(row => (
                        <tr key={row.id} className="hover:bg-gray-50">
                            {columns.map(column => (
                               <>
                                {column.key!=='view'?(<td
                                    key={column.key}
                                    className={`border p-2 ${pinnedColumns.includes(column.key) ? 'sticky left-0 bg-white' : ''}`}
                                    style={{width: columnWidths[column.key] || column.width}}
                                >
                                    {row[column.key]}
                                </td>) : (<td

                                    className={`border p-2 ${pinnedColumns.includes(column.key) ? 'sticky left-0 bg-white' : ''}`}
                                >
                                   <button type="button"
                                            className="text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">View
                                    </button>

                                </td>)}
                               </>

                            ))}

                        </tr>
                    ))}
                    </tbody>

                    {/* Aggregation Row */}
                    <tfoot className="sticky bottom-0 bg-gray-200">
                    <tr>

                        {columns.map(column => (
                            <td
                                key={column.key}
                                className={`border p-2 font-semibold ${pinnedColumns.includes(column.key) ? 'sticky left-0 bg-gray-200' : ''}`}
                                style={{ width: columnWidths[column.key] || column.width }}
                            >
                                {aggregations[column.key] ? aggregations[column.key] : ''}
                            </td>
                        ))}
                    </tr>
                    </tfoot>
                </table>
            </div>

            {/* Pagination Controls */}
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
