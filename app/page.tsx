'use client';
import React, { useState } from 'react';
import Home from './pages/index';
import D3Visualization from './pages/D3Visualization';
import FilterComponent from './pages/FilterComponent';
import { ApiResponse } from './pages/index';

const Page: React.FC = () => {
  const [responses, setResponses] = useState<ApiResponse[]>([]);
  const [filters, setFilters] = useState<{ [key: string]: string[] }>({});

  const handleFilterChange = (filterName: string, selectedOptions: string[]) => {
    setFilters(prevFilters => ({ ...prevFilters, [filterName]: selectedOptions }));
  };

  return (
    <div>
      <Home setResponses={setResponses} />
      <FilterComponent data={responses} onFilterChange={handleFilterChange} />
      <D3Visualization data={responses} filters={filters} />
    </div>
  );
};

export default Page;
