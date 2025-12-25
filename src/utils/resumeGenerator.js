/**
 * Resume Generator
 * Generates and downloads resume as PDF
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
      website: 'https://punitmishra.github.io',
      location: 'San Francisco Bay Area, CA',
      github: 'https://github.com/punitmishra',
      linkedin: 'https://linkedin.com/in/mishrapunit',
    },
    summary: 'Computer Engineer with 12+ years of experience building scalable applications from silicon to software. Specialized in AI/ML infrastructure, systems architecture, and enterprise software development.',
    experience: [
      {
        title: 'Senior Software Engineer',
        company: 'Enterprise Software Company',
        period: '2013 - Present',
        duration: '11+ years',
        location: 'San Francisco Bay Area, CA',
        achievements: [
          'Built v1 of core enterprise toolkit application from scratch',
          'Led development of scalable microservices architecture serving millions of users',
          'Architected secure AI infrastructure with LLM-powered applications',
          'Improved system performance by 40% through optimization initiatives',
          'Reduced infrastructure costs by 30% via cloud architecture improvements',
        ],
        tech: ['Vue.js', 'React', 'Next.js', 'Node.js', 'Python', 'Rust', 'AWS', 'Docker', 'Kubernetes'],
      },
      {
        title: 'Software Engineer',
        company: 'Technology Company',
        period: '2011 - 2013',
        duration: '2 years',
        location: 'United States',
        achievements: [
          'Developed enterprise software solutions for global clients',
          'Contributed to system design and architecture decisions',
          'Built data processing pipelines handling millions of records',
        ],
        tech: ['Java', 'JavaScript', 'SQL', 'Python'],
      },
    ],
    education: [
      {
        degree: "Bachelor's in Computer Science",
        school: 'UC Berkeley',
        period: '2007 - 2011',
        specializations: [
          'Computer Architecture & Systems',
          'Artificial Intelligence',
        ],
      },
    ],
    skills: [
      { category: 'Languages', items: ['JavaScript/TypeScript', 'Python', 'Rust', 'Java', 'Go'] },
      { category: 'Frameworks', items: ['Vue.js', 'React', 'Next.js', 'Node.js', 'FastAPI'] },
      { category: 'AI/ML', items: ['LangGraph', 'LangChain', 'Vector Search', 'CLIP', 'PyTorch'] },
      { category: 'Infrastructure', items: ['AWS', 'Docker', 'Kubernetes', 'PostgreSQL', 'Redis'] },
    ],
    certifications: [
      { name: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services', year: '2020' },
      { name: 'Kubernetes Administrator', issuer: 'CNCF', year: '2021' },
    ],
  };
}

/**
 * Download resume as PDF using html2pdf
 */
export async function downloadResumePDF() {
  const resumeData = generateResumeData();
  const resumeHTML = generateResumeHTML(resumeData);

  try {
    // Track download
    trackDownload('resume', 'resume.pdf');

    // Dynamically import html2pdf
    const html2pdfModule = await import('html2pdf.js');
    const html2pdf = html2pdfModule.default || html2pdfModule;

    if (!html2pdf) {
      throw new Error('html2pdf module not loaded');
    }

    // Create temporary container
    const container = document.createElement('div');
    container.innerHTML = resumeHTML;
    container.style.cssText = 'position: absolute; left: -9999px; top: 0; width: 210mm;';
    document.body.appendChild(container);

    // Get the body content for PDF generation
    const content = container.querySelector('body') || container;

    // PDF options
    const options = {
      margin: 10,
      filename: 'Punit_Mishra_Resume.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        logging: false
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait'
      },
    };

    // Generate and save PDF
    await html2pdf().set(options).from(content).save();

    // Cleanup
    document.body.removeChild(container);

  } catch (error) {
    console.error('Error generating PDF:', error);

    // Fallback: Open in new window for printing
    try {
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (printWindow) {
        printWindow.document.write(resumeHTML);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 500);
      } else {
        alert('Please allow popups to download the resume, or disable your popup blocker.');
      }
    } catch (e) {
      console.error('Print fallback also failed:', e);
      alert('Unable to generate resume. Please try again or contact support.');
    }
  }
}

/**
 * Generate HTML for resume
 */
function generateResumeHTML(data) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${data.personalInfo.name} - Resume</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; padding: 20px; }
        .header { border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 20px; }
        .header h1 { font-size: 32px; color: #2563eb; margin-bottom: 5px; }
        .header h2 { font-size: 18px; color: #666; margin-bottom: 10px; }
        .header .contact { display: flex; flex-wrap: wrap; gap: 15px; font-size: 14px; }
        .section { margin-bottom: 25px; }
        .section h3 { font-size: 20px; color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; margin-bottom: 15px; }
        .experience-item, .education-item { margin-bottom: 20px; }
        .experience-item h4 { font-size: 16px; font-weight: bold; margin-bottom: 5px; }
        .experience-item .company { color: #666; font-size: 14px; margin-bottom: 10px; }
        .experience-item ul { margin-left: 20px; margin-top: 10px; }
        .experience-item li { margin-bottom: 5px; font-size: 14px; }
        .skills-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
        .skill-category { margin-bottom: 15px; }
        .skill-category h4 { font-size: 14px; font-weight: bold; margin-bottom: 5px; }
        .skill-category p { font-size: 13px; color: #666; }
        .certifications { display: flex; flex-wrap: wrap; gap: 15px; }
        .cert-item { font-size: 14px; }
        .cert-item strong { display: block; }
        .cert-item span { color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${data.personalInfo.name}</h1>
        <h2>${data.personalInfo.title}</h2>
        <div class="contact">
          <span>📧 ${data.personalInfo.email}</span>
          <span>🌐 ${data.personalInfo.website}</span>
          <span>📍 ${data.personalInfo.location}</span>
          <span>💼 ${data.personalInfo.linkedin}</span>
        </div>
      </div>

      <div class="section">
        <h3>Summary</h3>
        <p>${data.summary}</p>
      </div>

      <div class="section">
        <h3>Professional Experience</h3>
        ${data.experience.map(exp => `
          <div class="experience-item">
            <h4>${exp.title}</h4>
            <div class="company">${exp.company} | ${exp.period} (${exp.duration}) | ${exp.location}</div>
            <ul>
              ${exp.achievements.map(ach => `<li>${ach}</li>`).join('')}
            </ul>
            <p style="margin-top: 10px; font-size: 13px; color: #666;">
              <strong>Technologies:</strong> ${exp.tech.join(', ')}
            </p>
          </div>
        `).join('')}
      </div>

      <div class="section">
        <h3>Education</h3>
        ${data.education.map(edu => `
          <div class="education-item">
            <h4>${edu.degree}</h4>
            <div class="company">${edu.school} | ${edu.period}</div>
            <p style="margin-top: 5px; font-size: 14px;">
              <strong>Specializations:</strong> ${edu.specializations.join(', ')}
            </p>
          </div>
        `).join('')}
      </div>

      <div class="section">
        <h3>Skills</h3>
        <div class="skills-grid">
          ${data.skills.map(skill => `
            <div class="skill-category">
              <h4>${skill.category}</h4>
              <p>${skill.items.join(', ')}</p>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="section">
        <h3>Certifications</h3>
        <div class="certifications">
          ${data.certifications.map(cert => `
            <div class="cert-item">
              <strong>${cert.name}</strong>
              <span>${cert.issuer} - ${cert.year}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </body>
    </html>
  `;
}

