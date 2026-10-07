import { Button, Col, Form, Row } from 'react-bootstrap';
import MyDatePicker from './MyDatePicker';

interface Props {
  value: Date;
  onChange: (date: Date | null) => void;
  onShift: (days: number) => void;
  error: string | undefined;
  labelWidth: 2 | 3;
}
export default function LedgerDateField({ value, onChange, onShift, error, labelWidth }: Props) {
  return (
    <Form.Group as={Row} className="mb-3">
      <Form.Label column sm={labelWidth}>
        날짜
      </Form.Label>
      <Col sm={12 - labelWidth}>
        <Row>
          <Col sm={labelWidth === 2 ? 8 : 7}>
            <MyDatePicker onChange={onChange} selected={value} className="form-control" />
            {error && (
              <span className="error" style={{ display: 'block' }}>
                {error}
              </span>
            )}
          </Col>
          <Col>
            <Button variant="outline-success" onClick={() => onShift(-1)}>
              전날
            </Button>
            <Button variant="outline-success" style={{ marginLeft: '5px' }} onClick={() => onShift(1)}>
              다음날
            </Button>
          </Col>
        </Row>
      </Col>
    </Form.Group>
  );
}
