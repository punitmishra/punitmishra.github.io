/**
 * Resume Generator
 * Generates modern, elegant resume as PDF
 */

import { trackDownload } from './analytics';

/**
 * Generate resume data structure
 */
export function generateResumeData() {
  return {
    personalInfo: {
      name: 'Punit Mishra',
      title: 'Senior Software Engineer',
      email: 'contact@punitmishra.com',
      phone: '',
      website: 'punitmishra.com',
      location: 'San Francisco Bay Area',
      github: 'github.com/punitmishra',
      linkedin: 'linkedin.com/in/mishrapunit',
      photo: 'https://github.com/punitmishra.png',
    },
    summary: 'Senior Software Engineer with 12+ years of experience architecting and building production systems at scale. Deep expertise in AI/ML infrastructure, distributed systems, and full-stack development. Track record of delivering high-impact projects from concept to production serving enterprise customers globally.',
    experience: [
      {
        title: 'Senior Software Engineer',
        company: 'SAP',
        period: '2013 — Present',
        location: 'Pleasanton, CA',
        achievements: [
          'Architected and built core enterprise platform from v0 to production, now serving Fortune 500 customers with millions of daily requests',
          'Led AI/ML infrastructure development including LLM integration, vector search (FAISS), and multi-agent systems using LangGraph',
          'Pioneered ML containerization strategy 3 years before industry adoption of MLOps practices',
          'Achieved 40% latency reduction and 3x throughput improvement through distributed caching and query optimization',
          'Reduced cloud infrastructure costs by $500K+ annually through resource optimization and intelligent autoscaling',
          'Technical lead for cross-functional teams of 5-8 engineers; mentored 10+ engineers across multiple teams',
        ],
        tech: ['Python', 'TypeScript', 'Java', 'Rust', 'Kubernetes', 'AWS', 'PostgreSQL', 'Redis', 'LangGraph'],
      },
    ],
    education: [
      {
        degree: 'B.S. Computer Science',
        school: 'University of California, Berkeley',
        period: '2010 — 2012',
        details: 'AI, Computer Architecture, Networks',
        honors: 'International Student Scholarship',
      },
      {
        degree: 'A.S. Engineering',
        school: 'Ohlone College',
        period: '2008 — 2010',
        details: 'Engineering Club VP, VEX Robotics',
        honors: 'Outstanding Engineering Student',
      },
    ],
    skills: {
      languages: ['Python', 'TypeScript', 'JavaScript', 'Rust', 'Java', 'Go', 'SQL'],
      frameworks: ['Vue.js', 'React', 'Next.js', 'Node.js', 'FastAPI', 'Flask'],
      aiml: ['LangGraph', 'LangChain', 'FAISS', 'Vector Search', 'RAG', 'PyTorch'],
      infrastructure: ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'PostgreSQL', 'Redis', 'Kafka'],
    },
    certifications: [
      { name: 'AWS Solutions Architect', year: '2020' },
      { name: 'Kubernetes Administrator (CKA)', year: '2021' },
    ],
    projects: [
      {
        name: 'Shield AI',
        description: 'AI-powered DNS filtering with real-time threat detection',
        tech: 'Rust, ML',
      },
      {
        name: 'Multi-Agent AI System',
        description: 'Orchestrated AI agents for complex task automation',
        tech: 'Python, LangGraph',
      },
    ],
  };
}

/**
 * Download resume as PDF
 */
export async function downloadResumePDF() {
  const resumeData = generateResumeData();
  const resumeHTML = generateModernHTML(resumeData);

  try {
    trackDownload('resume', 'resume.pdf');

    const html2pdfModule = await import('html2pdf.js');
    const html2pdf = html2pdfModule.default || html2pdfModule;

    if (!html2pdf) {
      throw new Error('html2pdf module not loaded');
    }

    const container = document.createElement('div');
    container.innerHTML = resumeHTML;
    container.style.cssText = 'position: absolute; left: -9999px; top: 0; width: 210mm;';
    document.body.appendChild(container);

    const content = container.querySelector('.resume-container') || container;

    const options = {
      margin: [0, 0, 0, 0],
      filename: 'Punit_Mishra_Resume.pdf',
      image: { type: 'jpeg', quality: 1 },
      html2canvas: {
        scale: 3,
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
    openPrintWindow(resumeHTML);
  }
}

function openPrintWindow(html) {
  const printWindow = window.open('', '_blank', 'width=800,height=1000');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  } else {
    alert('Please allow popups to download the resume.');
  }
}

/**
 * Generate modern, clean HTML resume
 */
function generateModernHTML(data) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${data.personalInfo.name} - Resume</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 9.5pt;
      line-height: 1.5;
      color: #1f2937;
      background: #fff;
      -webkit-font-smoothing: antialiased;
    }

    .resume-container {
      max-width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      padding: 32px 40px;
      background: #fff;
    }

    /* Header with photo */
    .header {
      display: flex;
      gap: 24px;
      margin-bottom: 24px;
      padding-bottom: 20px;
      border-bottom: 2px solid #3b82f6;
    }

    .header-photo {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid #3b82f6;
    }

    .header-content {
      flex: 1;
    }

    .header h1 {
      font-size: 28pt;
      font-weight: 700;
      color: #111827;
      letter-spacing: -0.5px;
      margin-bottom: 4px;
    }

    .header .title {
      font-size: 12pt;
      font-weight: 500;
      color: #3b82f6;
      margin-bottom: 10px;
    }

    .contact-row {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      font-size: 9pt;
      color: #6b7280;
    }

    .contact-item {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .contact-icon {
      width: 12px;
      height: 12px;
      fill: #9ca3af;
    }

    /* Two column layout */
    .main-content {
      display: grid;
      grid-template-columns: 1fr 200px;
      gap: 32px;
    }

    .left-column {
      min-width: 0;
    }

    .right-column {
      min-width: 0;
    }

    /* Sections */
    .section {
      margin-bottom: 20px;
    }

    .section-title {
      font-size: 11pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #3b82f6;
      margin-bottom: 12px;
      padding-bottom: 6px;
      border-bottom: 1px solid #e5e7eb;
    }

    /* Summary */
    .summary {
      font-size: 9.5pt;
      color: #374151;
      line-height: 1.6;
    }

    /* Experience */
    .experience-item {
      margin-bottom: 16px;
    }

    .experience-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 4px;
    }

    .experience-title {
      font-weight: 700;
      font-size: 11pt;
      color: #111827;
    }

    .experience-period {
      font-size: 9pt;
      color: #6b7280;
      font-weight: 500;
      white-space: nowrap;
    }

    .experience-company {
      font-weight: 500;
      color: #4b5563;
      font-size: 10pt;
      margin-bottom: 8px;
    }

    .experience-list {
      margin-left: 16px;
      font-size: 9pt;
      color: #374151;
    }

    .experience-list li {
      margin-bottom: 4px;
      line-height: 1.5;
    }

    .experience-list li::marker {
      color: #3b82f6;
    }

    .tech-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 10px;
    }

    .tech-tag {
      font-size: 8pt;
      padding: 3px 8px;
      background: #eff6ff;
      color: #3b82f6;
      border-radius: 4px;
      font-weight: 500;
    }

    /* Education */
    .education-item {
      margin-bottom: 12px;
    }

    .education-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }

    .education-degree {
      font-weight: 600;
      font-size: 10pt;
      color: #111827;
    }

    .education-period {
      font-size: 8pt;
      color: #6b7280;
    }

    .education-school {
      font-size: 9pt;
      color: #4b5563;
    }

    .education-details {
      font-size: 8pt;
      color: #6b7280;
      margin-top: 2px;
    }

    /* Skills */
    .skill-category {
      margin-bottom: 12px;
    }

    .skill-label {
      font-weight: 600;
      font-size: 9pt;
      color: #374151;
      margin-bottom: 4px;
    }

    .skill-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }

    .skill-tag {
      font-size: 8pt;
      padding: 2px 6px;
      background: #f3f4f6;
      color: #4b5563;
      border-radius: 3px;
    }

    /* Certifications */
    .cert-item {
      display: flex;
      justify-content: space-between;
      font-size: 9pt;
      margin-bottom: 6px;
      padding: 6px 8px;
      background: #f9fafb;
      border-radius: 4px;
    }

    .cert-name {
      font-weight: 500;
      color: #374151;
    }

    .cert-year {
      color: #6b7280;
      font-size: 8pt;
    }

    /* Projects */
    .project-item {
      margin-bottom: 10px;
      padding: 8px;
      background: #f9fafb;
      border-radius: 6px;
      border-left: 3px solid #3b82f6;
    }

    .project-name {
      font-weight: 600;
      font-size: 9pt;
      color: #111827;
    }

    .project-desc {
      font-size: 8pt;
      color: #6b7280;
      margin-top: 2px;
    }

    .project-tech {
      font-size: 7pt;
      color: #3b82f6;
      margin-top: 4px;
      font-weight: 500;
    }

    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .resume-container { padding: 24px 32px; }
    }
  </style>
</head>
<body>
  <div class="resume-container">
    <!-- Header -->
    <header class="header">
      <img src="${data.personalInfo.photo}" alt="${data.personalInfo.name}" class="header-photo" crossorigin="anonymous">
      <div class="header-content">
        <h1>${data.personalInfo.name}</h1>
        <div class="title">${data.personalInfo.title}</div>
        <div class="contact-row">
          <span class="contact-item">
            <svg class="contact-icon" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            ${data.personalInfo.location}
          </span>
          <span class="contact-item">
            <svg class="contact-icon" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
            ${data.personalInfo.email}
          </span>
          <span class="contact-item">
            <svg class="contact-icon" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
            ${data.personalInfo.website}
          </span>
          <span class="contact-item">
            <svg class="contact-icon" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            ${data.personalInfo.github}
          </span>
          <span class="contact-item">
            <svg class="contact-icon" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            ${data.personalInfo.linkedin}
          </span>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Left Column -->
      <div class="left-column">
        <!-- Summary -->
        <section class="section">
          <h2 class="section-title">Summary</h2>
          <p class="summary">${data.summary}</p>
        </section>

        <!-- Experience -->
        <section class="section">
          <h2 class="section-title">Experience</h2>
          ${data.experience.map(exp => `
            <div class="experience-item">
              <div class="experience-header">
                <span class="experience-title">${exp.title}</span>
                <span class="experience-period">${exp.period}</span>
              </div>
              <div class="experience-company">${exp.company} · ${exp.location}</div>
              <ul class="experience-list">
                ${exp.achievements.map(a => `<li>${a}</li>`).join('')}
              </ul>
              <div class="tech-tags">
                ${exp.tech.map(t => `<span class="tech-tag">${t}</span>`).join('')}
              </div>
            </div>
          `).join('')}
        </section>

        <!-- Education -->
        <section class="section">
          <h2 class="section-title">Education</h2>
          ${data.education.map(edu => `
            <div class="education-item">
              <div class="education-header">
                <span class="education-degree">${edu.degree}</span>
                <span class="education-period">${edu.period}</span>
              </div>
              <div class="education-school">${edu.school}</div>
              <div class="education-details">${edu.details} · ${edu.honors}</div>
            </div>
          `).join('')}
        </section>
      </div>

      <!-- Right Column -->
      <div class="right-column">
        <!-- Skills -->
        <section class="section">
          <h2 class="section-title">Skills</h2>
          <div class="skill-category">
            <div class="skill-label">Languages</div>
            <div class="skill-tags">
              ${data.skills.languages.map(s => `<span class="skill-tag">${s}</span>`).join('')}
            </div>
          </div>
          <div class="skill-category">
            <div class="skill-label">Frameworks</div>
            <div class="skill-tags">
              ${data.skills.frameworks.map(s => `<span class="skill-tag">${s}</span>`).join('')}
            </div>
          </div>
          <div class="skill-category">
            <div class="skill-label">AI/ML</div>
            <div class="skill-tags">
              ${data.skills.aiml.map(s => `<span class="skill-tag">${s}</span>`).join('')}
            </div>
          </div>
          <div class="skill-category">
            <div class="skill-label">Infrastructure</div>
            <div class="skill-tags">
              ${data.skills.infrastructure.map(s => `<span class="skill-tag">${s}</span>`).join('')}
            </div>
          </div>
        </section>

        <!-- Certifications -->
        <section class="section">
          <h2 class="section-title">Certifications</h2>
          ${data.certifications.map(c => `
            <div class="cert-item">
              <span class="cert-name">${c.name}</span>
              <span class="cert-year">${c.year}</span>
            </div>
          `).join('')}
        </section>

        <!-- Projects -->
        <section class="section">
          <h2 class="section-title">Projects</h2>
          ${data.projects.map(p => `
            <div class="project-item">
              <div class="project-name">${p.name}</div>
              <div class="project-desc">${p.description}</div>
              <div class="project-tech">${p.tech}</div>
            </div>
          `).join('')}
        </section>
      </div>
    </div>
  </div>
</body>
</html>`;
}
