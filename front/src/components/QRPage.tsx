import { useNavigate } from 'react-router-dom';
import Qrcode from './ui/Qrcode';

export default function QRPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <Qrcode onBack={handleBack} />
  );
}
