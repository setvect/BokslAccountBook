import { Alert } from 'react-bootstrap';

export default function ModalStatus({ loading, saving, error }: { loading: boolean; saving: boolean; error: string }) {
  return (
    <>
      {loading && <p role="status">불러오는 중…</p>}
      {saving && <p role="status">저장 중…</p>}
      {error && <Alert variant="danger">{error}</Alert>}
    </>
  );
}
