/**
 * Resume Generator
 * Generates elegant, professional resume as PDF
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
      location: 'Pleasanton, CA',
      github: 'github.com/punitmishra',
      linkedin: 'linkedin.com/in/mishrapunit',
    },
    summary: 'Senior Software Engineer with 12+ years of experience building production systems at scale. Deep expertise in AI/ML infrastructure, distributed systems, and full-stack development. Track record of delivering high-impact projects serving enterprise customers globally.',
    experience: [
      {
        title: 'Senior Software Engineer',
        company: 'SAP',
        period: '2013 — Present',
        location: 'Pleasanton, CA',
        achievements: [
          'Architected core enterprise platform from v0 to production, serving Fortune 500 customers with 1M+ daily requests',
          'Led AI/ML infrastructure: LLM integration, vector search (FAISS), multi-agent systems with LangGraph',
          'Achieved 40% latency reduction and 3x throughput via distributed caching and query optimization',
          'Reduced cloud costs by $500K+ annually through resource optimization and intelligent autoscaling',
          'Technical lead for teams of 5-8 engineers; mentored 10+ engineers across multiple teams',
        ],
        tech: ['Python', 'TypeScript', 'Rust', 'Kubernetes', 'AWS', 'PostgreSQL', 'LangGraph', 'FAISS'],
      },
      {
        title: 'Hardware & IoT Engineer',
        company: 'Personal Projects',
        period: '2020 — Present',
        location: 'Home Lab',
        achievements: [
          'Built Railroad Arcade: remote-controlled model railroad with real-time IoT via Raspberry Pi and WebSockets',
          'Developed Shield AI: high-performance DNS security in Rust with ML-based threat detection (<1ms latency)',
          'Deployed 5-node Raspberry Pi homelab with Docker, Prometheus/Grafana monitoring, and Cloudflare Tunnels',
        ],
        tech: ['Raspberry Pi', 'CircuitPython', 'Rust', 'Docker', 'Prometheus', 'Next.js', 'Solidity'],
      },
    ],
    education: [
      {
        degree: 'B.S. Computer Science',
        school: 'University of California, Berkeley',
        period: '2010 — 2012',
        details: 'AI, Computer Architecture, Networks • International Student Scholarship ($10,000)',
      },
    ],
    skills: {
      languages: ['Python', 'TypeScript', 'Rust', 'Java', 'Go', 'SQL', 'Solidity'],
      frontend: ['Vue.js', 'React', 'Next.js', 'Tailwind CSS'],
      backend: ['Node.js', 'FastAPI', 'PostgreSQL', 'Redis'],
      aiml: ['LangGraph', 'LangChain', 'FAISS', 'RAG', 'PyTorch'],
      infrastructure: ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'Cloudflare'],
      web3: ['Solidity', 'Hardhat', 'Wagmi', 'ERC-20', 'DeFi'],
    },
    certifications: [
      'AWS Solutions Architect (2020)',
      'Kubernetes Administrator - CKA (2021)',
    ],
  };
}

/**
 * Download resume as PDF
 */
export async function downloadResumePDF() {
  const resumeData = generateResumeData();
  const resumeHTML = generateProfessionalHTML(resumeData);

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
 * Generate professional, elegant HTML resume
 */
function generateProfessionalHTML(data) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${data.personalInfo.name} - Resume</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Source+Serif+Pro:wght@400;600;700&family=Source+Sans+Pro:wght@400;600&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Source Sans Pro', -apple-system, sans-serif;
      font-size: 9pt;
      line-height: 1.35;
      color: #2d2d2d;
      background: #fff;
    }

    .resume-container {
      max-width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      padding: 28px 40px;
      background: #fff;
    }

    /* Header */
    .header {
      margin-bottom: 14px;
      border-bottom: 2px solid #1a1a1a;
      padding-bottom: 12px;
    }

    .header h1 {
      font-family: 'Source Serif Pro', Georgia, serif;
      font-size: 22pt;
      font-weight: 700;
      color: #1a1a1a;
      letter-spacing: -0.5px;
      margin-bottom: 2px;
    }

    .header .title {
      font-size: 10pt;
      font-weight: 600;
      color: #555;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 8px;
    }

    .contact-row {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      font-size: 9pt;
      color: #444;
    }

    .contact-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .contact-icon {
      width: 11px;
      height: 11px;
      fill: #666;
    }

    /* Section */
    .section {
      margin-bottom: 12px;
    }

    .section-title {
      font-family: 'Source Serif Pro', Georgia, serif;
      font-size: 10pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #1a1a1a;
      margin-bottom: 6px;
      padding-bottom: 3px;
      border-bottom: 1px solid #ddd;
    }

    /* Summary */
    .summary {
      font-size: 9pt;
      color: #333;
      line-height: 1.4;
      text-align: justify;
    }

    /* Experience */
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
      font-weight: 700;
      font-size: 9.5pt;
      color: #1a1a1a;
    }

    .experience-period {
      font-size: 8.5pt;
      color: #666;
    }

    .experience-company {
      font-weight: 600;
      color: #444;
      font-size: 9pt;
      margin-bottom: 4px;
    }

    .experience-list {
      margin-left: 12px;
      font-size: 8.5pt;
      color: #333;
    }

    .experience-list li {
      margin-bottom: 2px;
      line-height: 1.35;
    }

    .experience-list li::marker {
      color: #888;
    }

    .tech-line {
      margin-top: 4px;
      font-size: 8pt;
      color: #555;
    }

    .tech-line strong {
      font-weight: 600;
      color: #333;
    }

    /* Two column layout */
    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    /* Education */
    .education-item {
      margin-bottom: 6px;
    }

    .education-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }

    .education-degree {
      font-weight: 700;
      font-size: 9pt;
      color: #1a1a1a;
    }

    .education-period {
      font-size: 8pt;
      color: #666;
    }

    .education-school {
      font-size: 8.5pt;
      color: #444;
      font-weight: 600;
    }

    .education-details {
      font-size: 8pt;
      color: #666;
      margin-top: 1px;
    }

    /* Skills */
    .skills-section {
      font-size: 8.5pt;
    }

    .skill-row {
      margin-bottom: 3px;
      line-height: 1.35;
    }

    .skill-label {
      font-weight: 700;
      color: #1a1a1a;
      display: inline;
    }

    .skill-items {
      color: #444;
    }

    /* Certifications */
    .cert-list {
      font-size: 8.5pt;
      color: #444;
    }

    .cert-list li {
      margin-bottom: 2px;
    }

    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .resume-container { padding: 20px 30px; }
    }
  </style>
</head>
<body>
  <div class="resume-container">
    <!-- Header -->
    <header class="header">
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
    </header>

    <!-- Summary -->
    <section class="section">
      <h2 class="section-title">Professional Summary</h2>
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
          <div class="experience-company">${exp.company} — ${exp.location}</div>
          <ul class="experience-list">
            ${exp.achievements.map(a => `<li>${a}</li>`).join('')}
          </ul>
          <div class="tech-line"><strong>Technologies:</strong> ${exp.tech.join(' · ')}</div>
        </div>
      `).join('')}
    </section>

    <!-- Two Column: Education & Skills -->
    <div class="two-col">
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
          </div>
        `).join('')}

        <h2 class="section-title" style="margin-top: 10px;">Certifications</h2>
        <ul class="cert-list">
          ${data.certifications.map(c => `<li>${c}</li>`).join('')}
        </ul>
      </section>

      <section class="section">
        <h2 class="section-title">Technical Skills</h2>
        <div class="skills-section">
          <div class="skill-row">
            <span class="skill-label">Languages:</span>
            <span class="skill-items"> ${data.skills.languages.join(' · ')}</span>
          </div>
          <div class="skill-row">
            <span class="skill-label">Frontend:</span>
            <span class="skill-items"> ${data.skills.frontend.join(' · ')}</span>
          </div>
          <div class="skill-row">
            <span class="skill-label">Backend:</span>
            <span class="skill-items"> ${data.skills.backend.join(' · ')}</span>
          </div>
          <div class="skill-row">
            <span class="skill-label">AI/ML:</span>
            <span class="skill-items"> ${data.skills.aiml.join(' · ')}</span>
          </div>
          <div class="skill-row">
            <span class="skill-label">Infrastructure:</span>
            <span class="skill-items"> ${data.skills.infrastructure.join(' · ')}</span>
          </div>
          <div class="skill-row">
            <span class="skill-label">Web3:</span>
            <span class="skill-items"> ${data.skills.web3.join(' · ')}</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</body>
</html>`;
}
