/**
 * Resume Generator
 * Generates FAANG-quality professional resume as PDF
 * Uses resume.json as single source of truth
 */

import { trackDownload } from './analytics';

/**
 * Fetch resume data from JSON file
 */
async function fetchResumeData() {
  const response = await fetch('/data-sources/resume.json');
  if (!response.ok) throw new Error('Failed to load resume data');
  return response.json();
}

/**
 * Format date string
 */
function formatDate(dateStr) {
  if (!dateStr) return 'Present';
  const [year, month] = dateStr.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return month ? `${months[parseInt(month) - 1]} ${year}` : year;
}

/**
 * Download resume as PDF
 */
export async function downloadResumePDF() {
  try {
    trackDownload('resume', 'resume.pdf');

    const resumeData = await fetchResumeData();
    const resumeHTML = generateEliteHTML(resumeData);

    const html2pdfModule = await import('html2pdf.js');
    const html2pdf = html2pdfModule.default || html2pdfModule;

    if (!html2pdf) {
      throw new Error('html2pdf module not loaded');
    }

    const container = document.createElement('div');
    container.innerHTML = resumeHTML;
    container.style.cssText = 'position: absolute; left: -9999px; top: 0; width: 210mm;';
    document.body.appendChild(container);

    const content = container.querySelector('.resume') || container;

    const options = {
      margin: [0, 0, 0, 0],
      filename: 'Punit_Mishra_Resume.pdf',
      image: { type: 'jpeg', quality: 1 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        logging: false,
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
      },
    };

    await html2pdf().set(options).from(content).save();
    document.body.removeChild(container);

  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error generating PDF. Please try again.');
  }
}

/**
 * Generate elite FAANG-style HTML resume
 * Based on best practices from Tech Interview Handbook and Resume Worded
 */
function generateEliteHTML(data) {
  const basics = data.basics;
  const experience = data.experience || [];
  const education = data.education || [];
  const skills = data.skills || [];
  const certifications = data.certifications || [];

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${basics.name} - Resume</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Times New Roman', Times, Georgia, serif;
      font-size: 10.5pt;
      line-height: 1.25;
      color: #000;
      background: #fff;
    }

    a {
      color: #0645AD;
      text-decoration: none;
    }

    .resume {
      width: 210mm;
      height: 297mm;
      padding: 12mm 14mm;
      background: #fff;
    }

    /* Header */
    .header {
      text-align: center;
      margin-bottom: 8pt;
      padding-bottom: 6pt;
      border-bottom: 1.5pt solid #000;
    }

    .name {
      font-size: 20pt;
      font-weight: bold;
      letter-spacing: 1pt;
      margin-bottom: 4pt;
    }

    .contact-line {
      font-size: 9.5pt;
      color: #333;
    }

    .contact-line a {
      color: #0645AD;
    }

    .separator {
      margin: 0 6pt;
      color: #666;
    }

    /* Section */
    .section {
      margin-bottom: 8pt;
    }

    .section-title {
      font-size: 11pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 1pt;
      border-bottom: 0.75pt solid #000;
      padding-bottom: 2pt;
      margin-bottom: 6pt;
    }

    /* Experience */
    .exp-item {
      margin-bottom: 8pt;
    }

    .exp-header {
      display: table;
      width: 100%;
      margin-bottom: 1pt;
    }

    .exp-left {
      display: table-cell;
    }

    .exp-right {
      display: table-cell;
      text-align: right;
    }

    .exp-title {
      font-weight: bold;
      font-size: 10.5pt;
    }

    .exp-company {
      font-style: italic;
    }

    .exp-date {
      font-size: 10pt;
    }

    .exp-location {
      font-size: 10pt;
      color: #444;
    }

    .achievements {
      margin-left: 16pt;
      margin-top: 3pt;
    }

    .achievements li {
      margin-bottom: 2pt;
      font-size: 10pt;
      line-height: 1.3;
    }

    /* Education */
    .edu-item {
      margin-bottom: 4pt;
    }

    .edu-header {
      display: table;
      width: 100%;
    }

    .edu-left {
      display: table-cell;
    }

    .edu-right {
      display: table-cell;
      text-align: right;
      font-size: 10pt;
    }

    .edu-degree {
      font-weight: bold;
      font-size: 10.5pt;
    }

    .edu-school {
      font-style: italic;
    }

    .edu-details {
      font-size: 9.5pt;
      color: #444;
      margin-top: 1pt;
    }

    /* Skills */
    .skills-grid {
      font-size: 10pt;
      line-height: 1.4;
    }

    .skill-row {
      margin-bottom: 2pt;
    }

    .skill-category {
      font-weight: bold;
    }

    /* Certifications */
    .certs {
      font-size: 10pt;
    }

    .cert-item {
      margin-bottom: 2pt;
    }

    /* Two column for bottom */
    .two-col {
      display: table;
      width: 100%;
    }

    .col-left {
      display: table-cell;
      width: 55%;
      vertical-align: top;
      padding-right: 12pt;
    }

    .col-right {
      display: table-cell;
      width: 45%;
      vertical-align: top;
    }
  </style>
</head>
<body>
  <div class="resume">
    <!-- Header -->
    <div class="header">
      <div class="name">${basics.name.toUpperCase()}</div>
      <div class="contact-line">
        ${basics.location}<span class="separator">|</span>
        <a href="mailto:${basics.email}">${basics.email}</a><span class="separator">|</span>
        <a href="https://punitmishra.com">punitmishra.com</a><span class="separator">|</span>
        <a href="${basics.profiles[0].url}">github.com/punitmishra</a><span class="separator">|</span>
        <a href="${basics.profiles[1].url}">linkedin.com/in/mishrapunit</a>
      </div>
    </div>

    <!-- Summary -->
    <div class="section">
      <div class="section-title">Summary</div>
      <div style="font-size: 10pt; line-height: 1.35;">
        ${basics.summary}
      </div>
    </div>

    <!-- Experience -->
    <div class="section">
      <div class="section-title">Professional Experience</div>
      ${experience.map(job => `
        <div class="exp-item">
          <div class="exp-header">
            <div class="exp-left">
              <span class="exp-title">${job.position}</span>, <span class="exp-company">${job.company}</span>
            </div>
            <div class="exp-right">
              <span class="exp-date">${formatDate(job.startDate)} – ${formatDate(job.endDate)}</span>
            </div>
          </div>
          <ul class="achievements">
            ${job.highlights.slice(0, 5).map(h => `<li>${h}</li>`).join('')}
          </ul>
        </div>
      `).join('')}
    </div>

    <!-- Two Column Layout for Education, Skills, Certs -->
    <div class="two-col">
      <div class="col-left">
        <!-- Education -->
        <div class="section">
          <div class="section-title">Education</div>
          ${education.map(edu => `
            <div class="edu-item">
              <div class="edu-header">
                <div class="edu-left">
                  <span class="edu-degree">${edu.degree} in ${edu.field}</span>, <span class="edu-school">${edu.institution}</span>
                </div>
                <div class="edu-right">${edu.endDate}</div>
              </div>
              ${edu.highlights ? `<div class="edu-details">${edu.highlights.join(' • ')}</div>` : ''}
            </div>
          `).join('')}
        </div>

        <!-- Certifications -->
        <div class="section">
          <div class="section-title">Certifications</div>
          <div class="certs">
            ${certifications.map(cert => `
              <div class="cert-item"><strong>${cert.name}</strong> — ${cert.issuer}, ${cert.date}</div>
            `).join('')}
          </div>
        </div>
      </div>

      <div class="col-right">
        <!-- Technical Skills -->
        <div class="section">
          <div class="section-title">Technical Skills</div>
          <div class="skills-grid">
            ${skills.map(cat => `
              <div class="skill-row">
                <span class="skill-category">${cat.category}:</span> ${cat.items.map(s => s.name).join(', ')}
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// Export for use in components
export { fetchResumeData, formatDate };
