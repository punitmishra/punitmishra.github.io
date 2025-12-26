/**
 * Resume Generator
 * Generates elegant LaTeX-style resume as PDF
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
    const resumeHTML = generateLatexHTML(resumeData);

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
 * Generate LaTeX-style HTML resume
 */
function generateLatexHTML(data) {
  const basics = data.basics;
  const experience = data.experience || [];
  const education = data.education || [];
  const skills = data.skills || [];
  const certifications = data.certifications || [];
  const projects = data.projects || [];

  // Get top 3 projects for the PDF
  const topProjects = projects.slice(0, 3);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${basics.name} - Resume</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&family=Source+Sans+Pro:wght@400;600&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Crimson Pro', 'Times New Roman', Georgia, serif;
      font-size: 10.5px;
      line-height: 1.3;
      color: #1a1a1a;
      background: #fff;
      -webkit-font-smoothing: antialiased;
    }

    a {
      color: #0066cc;
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }

    .resume {
      width: 210mm;
      height: 297mm;
      padding: 18mm 20mm;
      background: #fff;
      overflow: hidden;
    }

    /* Header - Centered LaTeX style */
    .header {
      text-align: center;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 0.5px solid #000;
    }

    .header h1 {
      font-size: 24px;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 2px;
    }

    .header .title {
      font-size: 11px;
      font-weight: 400;
      color: #444;
      letter-spacing: 1px;
      margin-bottom: 6px;
    }

    .header .contact {
      font-family: 'Source Sans Pro', sans-serif;
      font-size: 9px;
      color: #333;
    }

    .header .contact a {
      color: #0066cc;
    }

    .header .contact span {
      margin: 0 6px;
    }

    .header .contact .separator {
      color: #999;
    }

    /* Two column layout */
    .content {
      display: table;
      width: 100%;
      table-layout: fixed;
    }

    .main-col {
      display: table-cell;
      width: 68%;
      padding-right: 16px;
      vertical-align: top;
    }

    .side-col {
      display: table-cell;
      width: 32%;
      padding-left: 12px;
      border-left: 0.5px solid #ddd;
      vertical-align: top;
    }

    /* Section headers */
    .section {
      margin-bottom: 10px;
    }

    .section-title {
      font-family: 'Source Sans Pro', sans-serif;
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #000;
      margin-bottom: 6px;
      padding-bottom: 2px;
      border-bottom: 0.5px solid #ccc;
    }

    /* Summary */
    .summary {
      font-size: 9.5px;
      color: #333;
      line-height: 1.4;
      text-align: justify;
      margin-bottom: 2px;
    }

    /* Experience */
    .job {
      margin-bottom: 8px;
    }

    .job:last-child {
      margin-bottom: 0;
    }

    .job-header {
      display: table;
      width: 100%;
      margin-bottom: 1px;
    }

    .job-title {
      display: table-cell;
      font-weight: 700;
      font-size: 10px;
    }

    .job-period {
      display: table-cell;
      text-align: right;
      font-size: 9px;
      color: #666;
      font-style: italic;
    }

    .job-company {
      font-size: 9.5px;
      color: #444;
      margin-bottom: 3px;
    }

    .job-list {
      margin-left: 12px;
      font-size: 9px;
      color: #333;
    }

    .job-list li {
      margin-bottom: 1px;
      line-height: 1.3;
    }

    .tech-tags {
      font-family: 'Source Sans Pro', sans-serif;
      font-size: 8px;
      color: #555;
      margin-top: 3px;
    }

    /* Education */
    .edu-item {
      margin-bottom: 6px;
    }

    .edu-header {
      display: table;
      width: 100%;
    }

    .edu-degree {
      display: table-cell;
      font-weight: 700;
      font-size: 9.5px;
    }

    .edu-period {
      display: table-cell;
      text-align: right;
      font-size: 8.5px;
      color: #666;
      font-style: italic;
    }

    .edu-school {
      font-size: 9px;
      color: #444;
    }

    .edu-details {
      font-size: 8.5px;
      color: #666;
      margin-top: 1px;
    }

    /* Skills */
    .skill-category {
      margin-bottom: 6px;
    }

    .skill-category:last-child {
      margin-bottom: 0;
    }

    .skill-label {
      font-family: 'Source Sans Pro', sans-serif;
      font-size: 8.5px;
      font-weight: 700;
      color: #333;
      margin-bottom: 2px;
    }

    .skill-items {
      font-size: 8.5px;
      color: #444;
      line-height: 1.35;
    }

    /* Certifications */
    .cert-item {
      margin-bottom: 4px;
    }

    .cert-name {
      font-size: 9px;
      font-weight: 600;
    }

    .cert-issuer {
      font-size: 8px;
      color: #666;
    }

    /* Projects */
    .project-item {
      margin-bottom: 6px;
    }

    .project-item:last-child {
      margin-bottom: 0;
    }

    .project-name {
      font-size: 9px;
      font-weight: 700;
    }

    .project-name a {
      color: #0066cc;
    }

    .project-desc {
      font-size: 8px;
      color: #555;
      line-height: 1.3;
      margin-top: 1px;
    }
  </style>
</head>
<body>
  <div class="resume">
    <!-- Header -->
    <header class="header">
      <h1>${basics.name}</h1>
      <div class="title">${basics.title}</div>
      <div class="contact">
        ${basics.location}
        <span class="separator">|</span>
        <a href="mailto:${basics.email}">${basics.email}</a>
        <span class="separator">|</span>
        <a href="https://punitmishra.com" target="_blank">punitmishra.com</a>
        ${basics.profiles.slice(0, 2).map(p => `
          <span class="separator">|</span>
          <a href="${p.url}" target="_blank">${p.network}</a>
        `).join('')}
      </div>
    </header>

    <!-- Two Column Layout -->
    <div class="content">
      <!-- Main Column -->
      <div class="main-col">
        <!-- Summary -->
        <div class="section">
          <div class="section-title">Summary</div>
          <p class="summary">${basics.summary}</p>
        </div>

        <!-- Experience -->
        <div class="section">
          <div class="section-title">Experience</div>
          ${experience.map(job => `
            <div class="job">
              <div class="job-header">
                <span class="job-title">${job.position}</span>
                <span class="job-period">${formatDate(job.startDate)} — ${formatDate(job.endDate)}</span>
              </div>
              <div class="job-company">${job.company}</div>
              <ul class="job-list">
                ${job.highlights.slice(0, 4).map(h => `<li>${h}</li>`).join('')}
              </ul>
              <div class="tech-tags">${job.technologies.join(' · ')}</div>
            </div>
          `).join('')}
        </div>

        <!-- Education -->
        <div class="section">
          <div class="section-title">Education</div>
          ${education.map(edu => `
            <div class="edu-item">
              <div class="edu-header">
                <span class="edu-degree">${edu.degree} in ${edu.field}</span>
                <span class="edu-period">${edu.startDate} — ${edu.endDate}</span>
              </div>
              <div class="edu-school">${edu.institution}</div>
              ${edu.highlights ? `<div class="edu-details">${edu.highlights.join(' · ')}</div>` : ''}
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Side Column -->
      <div class="side-col">
        <!-- Skills -->
        <div class="section">
          <div class="section-title">Technical Skills</div>
          ${skills.map(cat => `
            <div class="skill-category">
              <div class="skill-label">${cat.category}</div>
              <div class="skill-items">${cat.items.map(s => s.name).join(', ')}</div>
            </div>
          `).join('')}
        </div>

        <!-- Certifications -->
        <div class="section">
          <div class="section-title">Certifications</div>
          ${certifications.map(cert => `
            <div class="cert-item">
              <div class="cert-name">${cert.name}</div>
              <div class="cert-issuer">${cert.issuer} · ${cert.date}</div>
            </div>
          `).join('')}
        </div>

        <!-- Projects -->
        <div class="section">
          <div class="section-title">Projects</div>
          ${topProjects.map(proj => `
            <div class="project-item">
              <div class="project-name"><a href="${proj.url}" target="_blank">${proj.name}</a></div>
              <div class="project-desc">${proj.highlights.slice(0, 2).join(' · ')}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// Export for use in components
export { fetchResumeData, formatDate };
