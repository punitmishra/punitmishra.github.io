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
      email: 'punitmishra@example.com',
      website: 'https://punitmishra.com',
      location: 'San Francisco Bay Area, CA',
      github: 'https://github.com/punitmishra',
      linkedin: 'https://linkedin.com/in/mishrapunit',
    },
    summary: 'Computer Engineer with 12+ years of experience building scalable applications from silicon to software. Specialized in AI/ML infrastructure, systems architecture, and enterprise software development.',
    experience: [
      {
        title: 'Senior Software Engineer',
        company: 'SAP',
        period: '2013 - Present',
        duration: '11+ years',
        location: 'San Francisco Bay Area, CA',
        achievements: [
          'Built v1 of core SAP toolkit application from scratch',
          'Led development of scalable microservices architecture',
          'Architected secure AI infrastructure with LLM-powered applications',
          'Improved system performance by 40%',
          'Reduced infrastructure costs by 30%',
        ],
        tech: ['Vue.js', 'React', 'Next.js', 'Node.js', 'Python', 'Rust', 'AWS', 'Docker', 'Kubernetes'],
      },
      {
        title: 'Software Engineer',
        company: 'IBM',
        period: '2011 - 2013',
        duration: '1.5 years',
        location: 'United States',
        achievements: [
          'Developed enterprise software solutions',
          'Contributed to system design and architecture',
        ],
        tech: ['Java', 'JavaScript', 'SQL'],
      },
    ],
    education: [
      {
        degree: "Bachelor's in Computer Engineering",
        school: 'University',
        period: '2007 - 2011',
        specializations: [
          'GPU and System Design',
          'Microfabrication and Microelectronics',
        ],
      },
    ],
    skills: [
      { category: 'Languages', items: ['JavaScript/TypeScript', 'Python', 'Rust', 'Java'] },
      { category: 'Frameworks', items: ['Vue.js', 'React', 'Next.js', 'Node.js'] },
      { category: 'AI/ML', items: ['LangGraph', 'LangChain', 'Vector Search', 'CLIP'] },
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
  try {
    // Track download
    trackDownload('resume', 'resume.pdf');

    // Check if html2pdf is available
    let html2pdf = null;
    try {
      html2pdf = (await import('html2pdf.js')).default;
    } catch (e) {
      console.warn('html2pdf.js not available, using print fallback');
    }
    
    if (!html2pdf) {
      // Fallback: Open resume in new window for printing
      const resumeWindow = window.open('', '_blank');
      const resumeData = generateResumeData();
      const resumeHTML = generateResumeHTML(resumeData);
      resumeWindow.document.write(resumeHTML);
      resumeWindow.document.close();
      resumeWindow.print();
      return;
    }

    const resumeData = generateResumeData();
    const resumeHTML = generateResumeHTML(resumeData);
    
    // Create temporary element
    const element = document.createElement('div');
    element.innerHTML = resumeHTML;
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    document.body.appendChild(element);

    // Generate PDF
    const opt = {
      margin: [10, 10, 10, 10],
      filename: 'Punit_Mishra_Resume.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    await html2pdf().set(opt).from(element).save();
    
    // Cleanup
    document.body.removeChild(element);
  } catch (error) {
    console.error('Error generating PDF:', error);
    // Fallback to print
    alert('PDF generation failed. Opening print dialog instead.');
    const resumeData = generateResumeData();
    const resumeHTML = generateResumeHTML(resumeData);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(resumeHTML);
    printWindow.document.close();
    printWindow.print();
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

