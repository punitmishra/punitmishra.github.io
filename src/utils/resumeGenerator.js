/**
 * Resume Generator
 * Generates clean, professional resume as PDF
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
    const resumeHTML = generateResumeHTML(resumeData);

    const html2pdfModule = await import('html2pdf.js');
    const html2pdf = html2pdfModule.default || html2pdfModule;

    if (!html2pdf) {
      throw new Error('html2pdf module not loaded');
    }

    const container = document.createElement('div');
    container.innerHTML = resumeHTML;
    container.style.cssText = 'position: absolute; left: -9999px; top: 0;';
    document.body.appendChild(container);

    const content = container.querySelector('.resume');

    const options = {
      margin: 0,
      filename: 'Punit_Mishra_Resume.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
      },
      jsPDF: {
        unit: 'in',
        format: 'letter',
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
 * Generate professional HTML resume
 */
function generateResumeHTML(data) {
  const basics = data.basics;
  const experience = data.experience || [];
  const education = data.education || [];
  const skills = data.skills || [];
  const certifications = data.certifications || [];

  // Combine skills into categories for compact display
  const skillsCompact = skills.map(cat =>
    `<strong>${cat.category}:</strong> ${cat.items.slice(0, 6).map(s => s.name).join(', ')}`
  ).join('<br>');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    .resume {
      width: 8.5in;
      min-height: 11in;
      padding: 0.5in 0.6in;
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 11px;
      line-height: 1.4;
      color: #000;
      background: #fff;
    }

    a {
      color: #0066cc;
      text-decoration: none;
    }

    .header {
      text-align: center;
      padding-bottom: 10px;
      border-bottom: 2px solid #000;
      margin-bottom: 12px;
    }

    .name {
      font-size: 24px;
      font-weight: bold;
      letter-spacing: 2px;
      margin-bottom: 6px;
    }

    .contact {
      font-size: 10px;
      color: #333;
    }

    .contact a {
      color: #0066cc;
    }

    .section {
      margin-bottom: 12px;
    }

    .section-title {
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 1px;
      border-bottom: 1px solid #000;
      padding-bottom: 3px;
      margin-bottom: 8px;
    }

    .job {
      margin-bottom: 10px;
    }

    .job-header {
      margin-bottom: 4px;
    }

    .job-title {
      font-weight: bold;
      font-size: 11px;
    }

    .job-company {
      font-style: italic;
    }

    .job-date {
      float: right;
      font-size: 10px;
      color: #444;
    }

    .job-bullets {
      margin-left: 18px;
      margin-top: 4px;
    }

    .job-bullets li {
      margin-bottom: 3px;
      font-size: 10px;
      line-height: 1.35;
    }

    .edu-row {
      margin-bottom: 6px;
    }

    .edu-degree {
      font-weight: bold;
    }

    .edu-school {
      font-style: italic;
    }

    .edu-date {
      float: right;
      font-size: 10px;
    }

    .edu-details {
      font-size: 10px;
      color: #444;
      margin-top: 2px;
    }

    .skills-content {
      font-size: 10px;
      line-height: 1.5;
    }

    .certs-content {
      font-size: 10px;
    }

    .cert-item {
      margin-bottom: 3px;
    }

    .clearfix::after {
      content: "";
      display: table;
      clear: both;
    }
  </style>
</head>
<body>
  <div class="resume">
    <div class="header">
      <div class="name">${basics.name.toUpperCase()}</div>
      <div class="contact">
        ${basics.location} &nbsp;|&nbsp;
        <a href="mailto:${basics.email}">${basics.email}</a> &nbsp;|&nbsp;
        <a href="https://punitmishra.com">punitmishra.com</a> &nbsp;|&nbsp;
        <a href="https://github.com/punitmishra">GitHub</a> &nbsp;|&nbsp;
        <a href="https://linkedin.com/in/mishrapunit">LinkedIn</a>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Summary</div>
      <div style="font-size: 10px; line-height: 1.4;">
        ${basics.summary}
      </div>
    </div>

    <div class="section">
      <div class="section-title">Professional Experience</div>
      ${experience.map(job => `
        <div class="job">
          <div class="job-header clearfix">
            <span class="job-date">${formatDate(job.startDate)} - ${formatDate(job.endDate)}</span>
            <span class="job-title">${job.position}</span>, <span class="job-company">${job.company}</span>
          </div>
          <ul class="job-bullets">
            ${job.highlights.slice(0, 4).map(h => `<li>${h}</li>`).join('')}
          </ul>
        </div>
      `).join('')}
    </div>

    <div class="section">
      <div class="section-title">Technical Skills</div>
      <div class="skills-content">
        ${skillsCompact}
      </div>
    </div>

    <div class="section">
      <div class="section-title">Education</div>
      ${education.map(edu => `
        <div class="edu-row clearfix">
          <span class="edu-date">${edu.endDate}</span>
          <span class="edu-degree">${edu.degree} in ${edu.field}</span>, <span class="edu-school">${edu.institution}</span>
          ${edu.highlights ? `<div class="edu-details">${edu.highlights[0]}</div>` : ''}
        </div>
      `).join('')}
    </div>

    <div class="section">
      <div class="section-title">Certifications</div>
      <div class="certs-content">
        ${certifications.map(cert => `
          <div class="cert-item"><strong>${cert.name}</strong> - ${cert.issuer} (${cert.date})</div>
        `).join('')}
      </div>
    </div>
  </div>
</body>
</html>`;
}

// Export for use in components
export { fetchResumeData, formatDate };
