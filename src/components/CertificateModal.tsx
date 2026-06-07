interface Props {
  name: string;
  completedAt: string;
  totalProblems: number;
  isSample?: boolean;
  isStandalone?: boolean;
  onClose: () => void;
}

function CertificateModal({
  name,
  completedAt,
  totalProblems,
  isSample = false,
  isStandalone = false,
  onClose,
}: Props) {
  const certificateContent = (
    <div className={`certificate ${isSample ? 'sample-certificate' : ''} ${isStandalone ? 'certificate-standalone' : ''}`}>
      <div className="certificate-border-top-left" />
      <div className="certificate-border-top-right" />
      <div className="certificate-header">
        <p className="certificate-label">Certificate of</p>
        <h1 className="certificate-title">Leetcode Completion</h1>
      </div>
      <p className="certificate-subtitle">This certificate is proudly presented to</p>
      <p className="certificate-name">{name}</p>
      <p className="certificate-hero">
        For successfully completing <strong>{totalProblems}</strong> Leetcode coding challenges
      </p>
      <p className="certificate-description">
        This achievement demonstrates commitment to continuous learning, logical thinking, and technical excellence in software development.
      </p>
      <div className="footer-row certificate-footer-row">
        <div className="certificate-stamp">
          <span>Verified by</span>
          <strong>LeetCode Dashboard</strong>
        </div>
        <div className="certificate-signature">
          <img src="/src/assets/signature.png" alt="Signature" className="signature-image" />
          <div className="signature-line"></div>
          <span className="signature-label">Signature</span>
        </div>
      </div>
      <p className="certificate-detail">Awarded on: {completedAt}</p>
      <button className="primary-button certificate-print-button" onClick={() => window.print()}>
        Print or Save PDF
      </button>
    </div>
  );

  if (isStandalone) {
    return certificateContent;
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-card">
        <button aria-label="Close certificate" className="close-button" onClick={onClose}>
          ×
        </button>
        {certificateContent}
      </div>
    </div>
  );
}

export default CertificateModal;
