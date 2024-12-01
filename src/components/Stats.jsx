import React from 'react';

function Stats({ totalIn, totalOut }) {
  return (
    <div className="stats">
      <div className="stat">
        <h3>Tổng vào</h3>
        <p>{totalIn}</p>
      </div>
      <div className="stat">
        <h3>Tổng ra</h3>
        <p>{totalOut}</p>
      </div>
    </div>
  );
}

export default Stats;
