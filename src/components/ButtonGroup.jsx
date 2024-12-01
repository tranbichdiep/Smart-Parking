import React from 'react';

function ButtonGroup({ handleConfirm, handleCancel }) {
  return (
    <div className="buttons">
      <button className="confirm-btn" onClick={handleConfirm}>
        Xác nhận
      </button>
      <button className="cancel-btn" onClick={handleCancel}>
        Hủy
      </button>
    </div>
  );
}

export default ButtonGroup;
