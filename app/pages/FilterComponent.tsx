import React from 'react';
import Select from 'react-select';
import { ApiResponse } from './index';

interface Props {
  data: ApiResponse[];
  onFilterChange: (filterName: string, selectedOptions: string[]) => void;
}

const FilterComponent: React.FC<Props> = ({ data, onFilterChange }) => {
  const handleChange = (filterName: string) => (selectedOptions: any) => {
    onFilterChange(filterName, selectedOptions ? selectedOptions.map((option: { value: string }) => option.value) : []);
  };

  return (
    <div>
      <label>Named Entities:</label>
      <Select
        isMulti
        options={data.flatMap(d => d.named_entities.map(e => ({ value: e.text, label: e.text })))}
        onChange={handleChange('named_entities')}
      />
      
      <label>Topics:</label>
      <Select
        isMulti
        options={data.flatMap(d => d.topics.map(e => ({ value: e.text, label: e.text })))}
        onChange={handleChange('topics')}
      />
      
      <label>Keywords:</label>
      <Select
        isMulti
        options={data.flatMap(d => d.keywords.map(e => ({ value: e, label: e })))}
        onChange={handleChange('keywords')}
      />
    </div>
  );
};

export default FilterComponent;
