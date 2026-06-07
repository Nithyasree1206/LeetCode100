import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import CertificateModal from '../components/CertificateModal';

function SampleCertificatePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="page-shell certificate-page-shell">
      <header className="certificate-page-header">
        <button className="secondary-button" onClick={() => navigate('/dashboard')}>
          Back to dashboard
        </button>
      </header>

      <main className="certificate-page-body">
        <CertificateModal
          name={user?.name ?? 'Sample Student'}
          completedAt={new Date().toLocaleDateString()}
          totalProblems={100}
          isSample
          isStandalone
          onClose={() => navigate('/dashboard')}
        />
      </main>
    </div>
  );
}

export default SampleCertificatePage;
