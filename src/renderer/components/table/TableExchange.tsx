import { Table } from 'react-bootstrap';
import React from 'react';

function TableExchange() {
  return (
    <Table striped bordered hover variant="dark">
      {/* 테이블 내용 */}
      <thead>
        <tr>
          <th>#</th>
          <th>Column 1</th>
          <th>Column 2</th>
          <th>Column 3</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>TableExchange</td>
          <td>Row 1 Column 2</td>
          <td>Row 1 Column 3</td>
        </tr>
        {/* 추가 데이터 행 */}
      </tbody>
    </Table>
  );
}

export default TableExchange;
