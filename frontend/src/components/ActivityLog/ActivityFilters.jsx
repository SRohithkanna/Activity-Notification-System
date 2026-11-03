import { useState } from 'react';

const ACTION_TYPES = ['', 'CREATED', 'UPDATED', 'STATUS_CHANGED', 'LOGIN', 'ASSIGNED'];

function ActivityFilters({ onFilter }) {
  const [filters, setFilters] = useState({
    actionType: '',
    entityType: '',
    search: '',
    from: '',
    to: ''
  });

  const handleChange = (e) => {
    const updated = { ...filters, [e.target.name]: e.target.value };
    setFilters(updated);
    onFilter(updated);
  };

  const handleReset = () => {
    const empty = { actionType: '', entityType: '', search: '', from: '', to: '' };
    setFilters(empty);
    onFilter(empty);
  };

  return (
    <div className="filters-bar">
      <input
        className="filter-input"
        type="text"
        name="search"
        placeholder="Search description..."
        value={filters.search}
        onChange={handleChange}
      />
      <select
        className="filter-select"
        name="actionType"
        value={filters.actionType}
        onChange={handleChange}
      >
        {ACTION_TYPES.map((type) => (
          <option key={type} value={type}>
            {type === '' ? 'All Actions' : type}
          </option>
        ))}
      </select>
      <input
        className="filter-input"
        type="text"
        name="entityType"
        placeholder="Entity type (e.g. Lead)"
        value={filters.entityType}
        onChange={handleChange}
      />
      <input
        className="filter-input"
        type="date"
        name="from"
        value={filters.from}
        onChange={handleChange}
      />
      <input
        className="filter-input"
        type="date"
        name="to"
        value={filters.to}  
        onChange={handleChange}
      />
      <button className="btn-reset" onClick={handleReset}>
        Reset
      </button>
    </div>
  );
}

export default ActivityFilters;