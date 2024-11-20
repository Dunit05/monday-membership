'use client';

import { useState } from 'react';

export default function Membership() {
  const [employeeId, setEmployeeId] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/fetchMembershipData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ employeeId }),
      });

      const result = await response.json();

      if (response.ok) {
        setData(result);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to fetch data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Check Membership Status</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor='employeeId'>Enter Membership ID:</label>
        <input
          type='text'
          id='employeeId'
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          required
        />
        <button type='submit'>Check Membership Status</button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {data && (
        <div>
          <h2>Member Name: {data.name}</h2>
          <p>Mambership Renewal Date: {data.renewalDate}</p>
          <p>Mambership Days to Renewal: {data.daysToRenewal}</p>
          <p>Mambership Status: {data.membershipStatus}</p>
        </div>
      )}
    </div>
  );
}
