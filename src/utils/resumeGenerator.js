/**
 * Resume Generator
 * Generates elegant LaTeX-style resume as PDF
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
      website: 'punitmishra.com',
      location: 'San Francisco Bay Area',
      github: 'github.com/punitmishra',
      linkedin: 'linkedin.com/in/mishrapunit',
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
          'Led SOC 2 compliance initiatives and implemented zero-trust security architecture',
        ],
        tech: ['Python', 'TypeScript', 'Java', 'Rust', 'Kubernetes', 'AWS', 'PostgreSQL', 'Redis', 'LangGraph'],
      },
    ],
    education: [
      {
        degree: 'Computer Science',
        school: 'University of California, Berkeley',
        period: '2010 — 2012',
        details: 'Coursework: Artificial Intelligence, Computer Architecture, Communication Networks, Signals & Systems',
        honors: 'International Student Scholarship ($10,000)',
      },
      {
        degree: 'Engineering',
        school: 'Ohlone College',
        period: '2008 — 2010',
        details: 'Engineering Club Vice President, VEX Robotics Competition',
        honors: 'Outstanding Engineering Student Award',
      },
    ],
    skills: {
      languages: ['Python', 'TypeScript', 'JavaScript', 'Rust', 'Java', 'Go', 'SQL'],
      frameworks: ['Vue.js', 'React', 'Next.js', 'Node.js', 'FastAPI', 'Flask'],
      aiml: ['LangGraph', 'LangChain', 'FAISS', 'Vector Search', 'RAG', 'PyTorch', 'Embeddings'],
      infrastructure: ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'PostgreSQL', 'Redis', 'Kafka'],
      practices: ['System Design', 'Microservices', 'CI/CD', 'Security', 'Performance Optimization'],
    },
    certifications: [
      { name: 'AWS Solutions Architect', year: '2020' },
      { name: 'Kubernetes Administrator (CKA)', year: '2021' },
    ],
  };
}

/**
 * Download resume as PDF
 */
export async function downloadResumePDF() {
  const resumeData = generateResumeData();
  const resumeHTML = generateLatexStyleHTML(resumeData);

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
      margin: [8, 10, 8, 10],
      filename: 'Punit_Mishra_Resume.pdf',
      image: { type: 'jpeg', quality: 0.98 },
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
 * Generate elegant LaTeX-style HTML
 */
function generateLatexStyleHTML(data) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${data.personalInfo.name} - Resume</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Times New Roman', Georgia, serif;
      font-size: 10pt;
      line-height: 1.35;
      color: #000;
      background: #fff;
    }

    .resume-container {
      max-width: 8.5in;
      margin: 0 auto;
      padding: 0.4in 0.5in;
      background: #fff;
    }

    .header {
      text-align: center;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #000;
    }

    .header h1 {
      font-size: 18pt;
      font-weight: bold;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 3px;
      color: #000;
    }

    .header .title {
      font-size: 10pt;
      color: #333;
      margin-bottom: 6px;
    }

    .contact-row {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 4px 12px;
      font-size: 9pt;
      color: #333;
    }

    .contact-row span { white-space: nowrap; }
    .contact-row a { color: #333; text-decoration: none; }

    .section {
      margin-bottom: 10px;
    }

    .section-title {
      font-size: 10pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 1px;
      border-bottom: 1px solid #000;
      padding-bottom: 2px;
      margin-bottom: 6px;
      color: #000;
    }

    .summary {
      font-size: 9.5pt;
      text-align: justify;
      color: #000;
      line-height: 1.4;
    }

    .experience-item {
      margin-bottom: 10px;
    }

    .experience-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 1px;
    }

    .experience-title {
      font-weight: bold;
      font-size: 10pt;
    }

    .experience-period {
      font-size: 9pt;
      color: #333;
      font-style: italic;
    }

    .experience-company {
      font-style: italic;
      color: #333;
      font-size: 9.5pt;
      margin-bottom: 4px;
    }

    .experience-list {
      margin-left: 14px;
      font-size: 9.5pt;
      padding-left: 0;
    }

    .experience-list li {
      margin-bottom: 2px;
      text-align: justify;
      line-height: 1.35;
    }

    .tech-stack {
      margin-top: 4px;
      font-size: 9pt;
      color: #333;
    }

    .tech-stack strong {
      font-weight: bold;
    }

    .education-item {
      margin-bottom: 8px;
    }

    .education-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }

    .education-degree {
      font-weight: bold;
      font-size: 10pt;
    }

    .education-period {
      font-size: 9pt;
      color: #333;
      font-style: italic;
    }

    .education-school {
      font-style: italic;
      color: #333;
      font-size: 9.5pt;
    }

    .education-details {
      font-size: 9pt;
      color: #333;
      margin-top: 1px;
    }

    .education-honors {
      font-size: 9pt;
      color: #333;
      font-style: italic;
    }

    .skills-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4px 16px;
      font-size: 9pt;
    }

    .skill-row {
      display: flex;
    }

    .skill-label {
      font-weight: bold;
      min-width: 80px;
      color: #000;
    }

    .skill-items {
      color: #333;
    }

    .cert-row {
      display: flex;
      gap: 20px;
      font-size: 9pt;
    }

    .cert-item { color: #333; }
    .cert-item strong { font-weight: bold; }

    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .resume-container { padding: 0.3in 0.4in; }
    }
  </style>
</head>
<body>
  <div class="resume-container">
    <header class="header">
      <h1>${data.personalInfo.name}</h1>
      <div class="title">${data.personalInfo.title}</div>
      <div class="contact-row">
        <span>${data.personalInfo.location}</span>
        <span>|</span>
        <span>${data.personalInfo.email}</span>
        <span>|</span>
        <span>${data.personalInfo.website}</span>
        <span>|</span>
        <span>${data.personalInfo.github}</span>
        <span>|</span>
        <span>${data.personalInfo.linkedin}</span>
      </div>
    </header>

    <section class="section">
      <h2 class="section-title">Summary</h2>
      <p class="summary">${data.summary}</p>
    </section>

    <section class="section">
      <h2 class="section-title">Experience</h2>
      ${data.experience.map(exp => `
        <div class="experience-item">
          <div class="experience-header">
            <span class="experience-title">${exp.title}</span>
            <span class="experience-period">${exp.period}</span>
          </div>
          <div class="experience-company">${exp.company}, ${exp.location}</div>
          <ul class="experience-list">
            ${exp.achievements.map(a => `<li>${a}</li>`).join('')}
          </ul>
          <div class="tech-stack"><strong>Technologies:</strong> ${exp.tech.join(', ')}</div>
        </div>
      `).join('')}
    </section>

    <section class="section">
      <h2 class="section-title">Education</h2>
      ${data.education.map(edu => `
        <div class="education-item">
          <div class="education-header">
            <span class="education-degree">${edu.degree}</span>
            <span class="education-period">${edu.period}</span>
          </div>
          <div class="education-school">${edu.school}</div>
          <div class="education-details">${edu.details}</div>
          ${edu.honors ? `<div class="education-honors">${edu.honors}</div>` : ''}
        </div>
      `).join('')}
    </section>

    <section class="section">
      <h2 class="section-title">Technical Skills</h2>
      <div class="skills-grid">
        <div class="skill-row">
          <span class="skill-label">Languages:</span>
          <span class="skill-items">${data.skills.languages.join(', ')}</span>
        </div>
        <div class="skill-row">
          <span class="skill-label">Frameworks:</span>
          <span class="skill-items">${data.skills.frameworks.join(', ')}</span>
        </div>
        <div class="skill-row">
          <span class="skill-label">AI/ML:</span>
          <span class="skill-items">${data.skills.aiml.join(', ')}</span>
        </div>
        <div class="skill-row">
          <span class="skill-label">Infrastructure:</span>
          <span class="skill-items">${data.skills.infrastructure.join(', ')}</span>
        </div>
      </div>
    </section>

    <section class="section">
      <h2 class="section-title">Certifications</h2>
      <div class="cert-row">
        ${data.certifications.map(c => `
          <div class="cert-item"><strong>${c.name}</strong> (${c.year})</div>
        `).join('')}
      </div>
    </section>
  </div>
</body>
</html>`;
}
