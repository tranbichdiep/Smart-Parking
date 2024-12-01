import React from 'react';
import Stats from './Stats';
import ButtonGroup from './ButtonGroup';

function LeftPanel({
  idCard,
  setIdCard,
  entryTime,
  setEntryTime,
  totalIn,
  totalOut,
  handleConfirm,
  handleCancel,
}) {
  return (
    <div className="left-panel">
      <div className="input-group">
        <label htmlFor="idCard">ID thẻ quẹt:</label>
        <input
          type="text"
          id="idCard"
          value={idCard}
          onChange={(e) => setIdCard(e.target.value)}
          placeholder="Nhập ID thẻ"
        />
      </div>
      <div className="input-group">
        <label htmlFor="entryTime">Thời gian vào:</label>
        <input
          type="text"
          id="entryTime"
          value={entryTime}
          onChange={(e) => setEntryTime(e.target.value)}
          placeholder="Nhập thời gian vào"
        />
      </div>
      <Stats totalIn={totalIn} totalOut={totalOut} />
      <ButtonGroup handleConfirm={handleConfirm} handleCancel={handleCancel} />
    </div>
  );
}

export default LeftPanel;
