import type { ApiTeam } from '@/api/teams';

export function generateTeamsPdfReport(
  teams: ApiTeam[],
  options: { title?: string; filterName?: string } = {}
) {
  const generatedAt = new Date().toLocaleString('en-IN', {
    dateStyle: 'full',
    timeStyle: 'medium',
    timeZone: 'Asia/Kolkata',
  });

  const totalTeams = teams.length;
  const validTeams = teams.filter((t) => t.data_integrity?.is_valid).length;
  const duplicateTeams = teams.filter((t) => t.data_integrity?.has_duplicate_leader).length;
  const testTeams = teams.filter((t) => t.data_integrity?.is_test_record).length;
  const ghostMembersCount = teams.reduce(
    (acc, t) => acc + (t.data_integrity?.ghost_member_count || 0),
    0
  );
  const totalStudents = teams.reduce((acc, t) => acc + (t.members?.length || 0), 0);

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${options.title || 'SIH 2026 Portal — Complete Teams Report'}</title>
  <style>
    @page {
      size: A4;
      margin: 15mm 15mm 20mm 15mm;
      @bottom-right {
        content: "Page " counter(page) " of " counter(pages);
      }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #000;
      background: #fff;
      margin: 0;
      padding: 0;
      font-size: 11pt;
      line-height: 1.4;
    }
    h1, h2, h3, h4 {
      color: #000;
      margin-top: 0;
      font-weight: 700;
    }
    .header {
      border-bottom: 2px solid #000;
      padding-bottom: 12px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .header-title {
      font-size: 18pt;
      letter-spacing: -0.5px;
      text-transform: uppercase;
    }
    .header-sub {
      font-size: 9pt;
      color: #444;
      text-align: right;
    }
    .summary-box {
      border: 1px solid #000;
      padding: 12px;
      margin-bottom: 24px;
      background: #fafafa;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 8px;
      text-align: center;
    }
    .summary-stat {
      border-right: 1px solid #ddd;
      padding: 4px;
    }
    .summary-stat:last-child {
      border-right: none;
    }
    .stat-val {
      font-size: 16pt;
      font-weight: bold;
    }
    .stat-lbl {
      font-size: 8pt;
      text-transform: uppercase;
      color: #555;
    }
    .section-title {
      font-size: 13pt;
      border-bottom: 1px solid #000;
      padding-bottom: 4px;
      margin-top: 24px;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
      font-size: 9.5pt;
    }
    th, td {
      border: 1px solid #ccc;
      padding: 6px 8px;
      text-align: left;
    }
    th {
      background: #f0f0f0;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 8.5pt;
    }
    .badge {
      display: inline-block;
      padding: 2px 6px;
      font-size: 7.5pt;
      font-weight: bold;
      border-radius: 2px;
      border: 1px solid #000;
      text-transform: uppercase;
      margin-right: 4px;
    }
    .badge-valid { background: #e6fffa; color: #004d40; border-color: #004d40; }
    .badge-duplicate { background: #fff8e1; color: #827717; border-color: #827717; }
    .badge-ghost { background: #efebe9; color: #3e2723; border-color: #3e2723; }
    .badge-test { background: #f3e5f5; color: #4a148c; border-color: #4a148c; }
    .badge-incomplete { background: #ffebee; color: #b71c1c; border-color: #b71c1c; }
    .team-card {
      border: 1px solid #000;
      padding: 16px;
      margin-bottom: 24px;
      page-break-inside: avoid;
    }
    .team-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #ddd;
      padding-bottom: 8px;
      margin-bottom: 12px;
    }
    .team-name {
      font-size: 14pt;
      font-weight: bold;
    }
    .integrity-box {
      border: 1px dashed #000;
      background: #f9f9f9;
      padding: 10px;
      margin-top: 12px;
      font-size: 9pt;
    }
    .integrity-title {
      font-weight: bold;
      text-transform: uppercase;
      font-size: 8.5pt;
      margin-bottom: 4px;
    }
    .page-break {
      page-break-after: always;
    }
    @media print {
      body { -webkit-print-color-adjust: exact; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="padding: 12px; background: #222; color: #fff; text-align: center; font-family: sans-serif;">
    <span>SIH 2026 Admin Export — Official Team Roster & Data Integrity Report</span>
    <button onclick="window.print()" style="margin-left: 20px; padding: 6px 16px; font-weight: bold; cursor: pointer;">Print / Save as PDF</button>
  </div>

  <div style="padding: 20px;">
    <div class="header">
      <div>
        <div class="header-title">NCET SIH 2026 Portal</div>
        <div style="font-size: 11pt; font-weight: 600;">Complete Team Roster & Data Integrity Audit Report</div>
      </div>
      <div class="header-sub">
        <div>Generated: <strong>${generatedAt}</strong></div>
        <div>Filter: <strong>${options.filterName || 'All Records (Everything Included)'}</strong></div>
      </div>
    </div>

    <div class="summary-box">
      <div class="summary-grid">
        <div class="summary-stat">
          <div class="stat-val">${totalTeams}</div>
          <div class="stat-lbl">Total Teams</div>
        </div>
        <div class="summary-stat">
          <div class="stat-val">${validTeams}</div>
          <div class="stat-lbl">Valid Teams</div>
        </div>
        <div class="summary-stat">
          <div class="stat-val">${duplicateTeams}</div>
          <div class="stat-lbl">Duplicate Teams</div>
        </div>
        <div class="summary-stat">
          <div class="stat-val">${testTeams}</div>
          <div class="stat-lbl">Test Records</div>
        </div>
        <div class="summary-stat">
          <div class="stat-val">${ghostMembersCount}</div>
          <div class="stat-lbl">Ghost Members</div>
        </div>
        <div class="summary-stat">
          <div class="stat-val">${totalStudents}</div>
          <div class="stat-lbl">Total Students</div>
        </div>
      </div>
    </div>

    <div class="section-title">Table of Contents / Team Index</div>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Team Name</th>
          <th>Leader USN</th>
          <th>Theme</th>
          <th>Members</th>
          <th>Status</th>
          <th>Integrity Classification</th>
        </tr>
      </thead>
      <tbody>
        ${teams
          .map(
            (t, idx) => `
          <tr>
            <td>${idx + 1}</td>
            <td><strong>${t.name}</strong></td>
            <td><code>${t.leader_usn}</code></td>
            <td>${t.theme || 'N/A'}</td>
            <td>${t.members?.length || 0}</td>
            <td>${t.status}</td>
            <td>
              ${(t.data_integrity?.flags || ['VALID'])
                .map((f) => `<span class="badge badge-${f.toLowerCase().replace(/\s+/g, '-')}">${f}</span>`)
                .join('')}
            </td>
          </tr>`
          )
          .join('')}
      </tbody>
    </table>

    <div class="page-break"></div>

    <div class="section-title">Detailed Per-Team Audit Records</div>

    ${teams
      .map(
        (t, idx) => `
      <div class="team-card">
        <div class="team-header">
          <div>
            <span class="team-name">#${idx + 1}. ${t.name}</span>
            <span style="font-size: 9pt; color: #666; margin-left: 8px;">(ID: ${t.id})</span>
          </div>
          <div>
            ${(t.data_integrity?.flags || ['VALID'])
              .map((f) => `<span class="badge badge-${f.toLowerCase().replace(/\s+/g, '-')}">${f}</span>`)
              .join('')}
          </div>
        </div>

        <table style="margin-bottom: 12px;">
          <tr>
            <th style="width: 15%;">Theme</th>
            <td style="width: 35%;">${t.theme || 'Not Specified'}</td>
            <th style="width: 15%;">Problem Statement</th>
            <td style="width: 35%;">${t.problem_statement_id || 'Not Selected'}</td>
          </tr>
          <tr>
            <th>Status</th>
            <td><strong>${t.status}</strong> (${t.is_locked ? 'Locked' : 'Unlocked'})</td>
            <th>Created At</th>
            <td>${t.created_at || 'N/A'}</td>
          </tr>
          <tr>
            <th>Level 1 Screening</th>
            <td>Status: <strong>${t.level1?.status || 'pending'}</strong> | Score: ${t.level1?.score ?? 'N/A'}</td>
            <th>Level 2 Screening</th>
            <td>Status: <strong>${t.level2?.status || 'pending'}</strong> | Score: ${t.level2?.score ?? 'N/A'}</td>
          </tr>
        </table>

        <div style="font-weight: bold; font-size: 9pt; margin-bottom: 4px; text-transform: uppercase;">Team Roster (${t.members?.length || 0} Members)</div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>USN</th>
              <th>Email</th>
              <th>Gender</th>
              <th>Dept / Year</th>
              <th>Role</th>
              <th>Account Status</th>
            </tr>
          </thead>
          <tbody>
            ${(t.members || [])
              .map(
                (m, mIdx) => `
              <tr>
                <td>${mIdx + 1}</td>
                <td><strong>${m.name}</strong></td>
                <td><code>${m.usn}</code> ${m.has_whitespace ? '<span title="Contains whitespace" style="color:red;">[SPACE]</span>' : ''}</td>
                <td>${m.email || 'N/A'}</td>
                <td>${m.gender}</td>
                <td>${m.department} / Yr ${m.year}</td>
                <td><strong>${m.role}</strong></td>
                <td>
                  ${
                    m.is_ghost_member
                      ? '<span class="badge badge-ghost">GHOST MEMBER</span>'
                      : '<span class="badge badge-valid">REGISTERED USER</span>'
                  }
                </td>
              </tr>`
              )
              .join('')}
          </tbody>
        </table>

        <div class="integrity-box">
          <div class="integrity-title">DATA INTEGRITY FINDINGS</div>
          ${
            (t.data_integrity?.findings || []).length > 0
              ? `<ul style="margin: 4px 0; padding-left: 20px;">
                  ${t.data_integrity?.findings.map((f) => `<li>${f}</li>`).join('')}
                 </ul>`
              : '<div>✓ No integrity issues detected. Team meets all portal rules.</div>'
          }
        </div>
      </div>`
      )
      .join('')}

  </div>
</body>
</html>`;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
}
