import React from 'react';
import QRCode from 'qrcode.react';
import { Download, Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';

export const StudentQRCode = ({ studentId, studentName }) => {
  const qrRef = React.useRef();

  const handlePrint = useReactToPrint({
    content: () => qrRef.current,
  });

  const handleDownload = () => {
    const canvas = qrRef.current.querySelector('canvas');
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `${studentName}-qr.png`;
    link.click();
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div ref={qrRef} className="p-4 bg-white">
        <QRCode value={studentId} size={256} level="H" includeMargin={true} />
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          <Download size={18} />
          Download
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          <Printer size={18} />
          Print
        </button>
      </div>
    </div>
  );
};
