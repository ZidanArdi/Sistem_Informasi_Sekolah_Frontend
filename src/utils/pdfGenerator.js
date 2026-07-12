import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

export const generateCredentialPDF = async (user, schoolProfile) => {
  // A4 dimensions: 210 x 297 mm
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor = '#166534'; // Green-800
  const darkTextColor = '#111827'; // Gray-900
  const lightTextColor = '#6b7280'; // Gray-500

  // 1. Watermark: OFFICIAL ACCOUNT CREDENTIAL
  doc.saveGraphicsState();
  doc.setGState(new doc.GState({ opacity: 0.04 }));
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(32);
  doc.setTextColor(150, 150, 150);
  doc.text('OFFICIAL ACCOUNT CREDENTIAL', 105, 148, {
    align: 'center',
    angle: 45
  });
  doc.restoreGraphicsState();

  // 2. School Logo & Header
  doc.setFillColor(22, 101, 52); // green background
  doc.roundedRect(20, 20, 20, 20, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('SMK', 30, 32, { align: 'center' });

  // School Details (Right of logo)
  const schoolName = schoolProfile?.name || 'SMK Negeri 1 Salatiga';
  const schoolAddress = schoolProfile?.address || 'Jl. Diponegoro No. 25, Salatiga';
  const schoolPhone = schoolProfile?.phone || '(0298) 123456';
  const schoolEmail = schoolProfile?.email || 'info@smkn1salatiga.sch.id';
  const schoolWebsite = schoolProfile?.website || 'https://smkn1salatiga.sch.id';
  const contactText = `Telp: ${schoolPhone} | Email: ${schoolEmail} | Web: ${schoolWebsite}`;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(darkTextColor);
  doc.text(schoolName, 45, 25);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(lightTextColor);
  doc.text(schoolAddress, 45, 30);
  doc.text(contactText, 45, 35);

  // Divider Line
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(20, 45, 190, 45);
  doc.setLineWidth(1.5);
  doc.setDrawColor(22, 101, 52); // primary color
  doc.line(20, 47, 190, 47);

  // 3. Document Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(primaryColor);
  doc.text('KREDENSIAL AKUN PENGGUNA', 105, 62, { align: 'center' });
  doc.setFontSize(9);
  doc.setTextColor(lightTextColor);
  doc.text('SCHOOL INFORMATION SYSTEM - OFFICIAL CREDENTIAL DOCUMENT', 105, 68, { align: 'center' });

  // 4. Credentials Details Card Layout (Gray Background)
  doc.setFillColor(249, 250, 251); // Gray-50
  doc.roundedRect(20, 75, 170, 75, 4, 4, 'F');
  doc.setDrawColor(229, 231, 235); // Gray-200
  doc.setLineWidth(0.3);
  doc.roundedRect(20, 75, 170, 75, 4, 4, 'D');

  const rawRole = (user.role || '').toLowerCase();
  const displayRole = rawRole === 'admin' ? 'Administrator' : rawRole === 'guru' ? 'Teacher' : 'Student';
  const idLabel = rawRole === 'siswa' ? 'Nomor Induk Siswa (NIS)' : (rawRole === 'guru' ? 'Nomor Induk Guru (NIG)' : 'Kode Admin');
  const userIdValue = user.identifier || user.nis || user.nip;

  const rows = [
    { label: 'Nama Lengkap', value: user.name || user.nama },
    { label: 'Peran Akses (Role)', value: displayRole },
    { label: idLabel, value: userIdValue },
    { label: 'Email Login', value: user.email || '-' },
    { label: 'Kata Sandi Default', value: user.password || '-' },
  ];

  let currentY = 87;
  rows.forEach((row) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(lightTextColor);
    doc.text(row.label, 26, currentY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(darkTextColor);
    doc.text(`:   ${row.value}`, 75, currentY);

    currentY += 11;
  });

  // 5. Security Notice Box (Amber Background)
  doc.setFillColor(254, 243, 199); // Amber-100
  doc.roundedRect(20, 160, 170, 20, 3, 3, 'F');
  doc.setDrawColor(245, 158, 11); // Amber-500
  doc.setLineWidth(0.3);
  doc.roundedRect(20, 160, 170, 20, 3, 3, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(180, 83, 9); // Amber-800
  doc.text('⚠ SECURITY NOTICE / PERINGATAN KEAMANAN:', 25, 167);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(180, 83, 9);
  doc.text('Please change your password immediately after your first login to secure your account.', 25, 173);

  // 6. QR Code Section (Bottom Right)
  const loginBaseUrl = import.meta.env.VITE_LOGIN_URL || 'http://localhost:5173/login';
  
  // Safe Fallback Resolution
  let roleParam = '';
  if (rawRole === 'admin' || rawRole === 'administrator') {
    roleParam = 'admin';
  } else if (rawRole === 'guru' || rawRole === 'teacher') {
    roleParam = 'guru';
  } else if (rawRole === 'siswa' || rawRole === 'student') {
    roleParam = 'siswa';
  }

  const loginUrl = roleParam ? `${loginBaseUrl}?role=${roleParam}` : loginBaseUrl;
  
  // QR Positions: 35mm x 35mm
  const qrX = 145;
  const qrY = 195;
  const qrSize = 35;

  let qrSuccess = false;
  try {
    const qrDataUrl = await QRCode.toDataURL(loginUrl, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 150,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      }
    });

    doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
    qrSuccess = true;
  } catch (err) {
    console.error('QR Code generation failed, applying failsafe...', err);
  }

  // Text below QR Code
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(lightTextColor);
  if (qrSuccess) {
    doc.text('Pindai QR Code untuk Login', qrX + 17.5, qrY + qrSize + 4, { align: 'center' });
  } else {
    // If QR Fails, draw placeholder box and plain text URL as fallback
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    doc.rect(qrX, qrY, qrSize, qrSize, 'D');
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.text('[QR Code Error]', qrX + 17.5, qrY + 18, { align: 'center' });
  }

  // Always output Login URL as text for accessibility and failsafe
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(primaryColor);
  doc.text(`Login URL: ${loginUrl}`, 20, 215);

  // 7. Footer details (Document ID, Version, Date, Time)
  const now = new Date();
  const dateStr = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const uniqueDocId = `DOC-${rawRole.toUpperCase()}-${userIdValue}-${now.getTime().toString().slice(-6)}`;
  const appVersion = 'v1.0.0-RC';

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(lightTextColor);
  
  doc.text(`Generated automatically by School Information System`, 20, 250);
  doc.text(`Document ID: ${uniqueDocId}`, 20, 255);
  doc.text(`Generated Date/Time: ${dateStr} ${timeStr}`, 20, 260);
  doc.text(`Application Version: ${appVersion}`, 20, 265);

  // Save the PDF
  const filename = `Credential_${rawRole}_${userIdValue}.pdf`;
  doc.save(filename);
};
