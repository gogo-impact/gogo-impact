/**
 * PDF Export Utility for Impact Report
 * 
 * Generates a PDF containing:
 * 1. The full impact report as rendered on the web (via iframe)
 * 2. A pretty-printed JSON dump of all customization options
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  fetchHeroContent,
  fetchMissionContent,
  fetchPopulationContent,
  fetchFinancialContent,
  fetchMethodContent,
  fetchCurriculumContent,
  fetchImpactSectionContent,
  fetchHearOurImpactContent,
  fetchTestimonialsContent,
  fetchNationalImpactContent,
  fetchFlexAContent,
  fetchFlexBContent,
  fetchFlexCContent,
  fetchImpactLevelsContent,
  fetchPartnersContent,
  fetchFooterContent,
  fetchDefaults,
} from '../../services/impact.api';

// Keys to filter out from the JSON dump (images only, not colors)
const IMAGE_KEYS = [
  'backgroundImage',
  'imageUrl',
  'backgroundImagePreview',
  'populationPhotos',
  'topCarouselImages',
  'bottomCarouselImages',
  'heroImage',
  'poster',
  'logo',
];

// Check if a key contains image data to be excluded
function shouldExcludeKey(key: string): boolean {
  const lowerKey = key.toLowerCase();
  return IMAGE_KEYS.some(imgKey => lowerKey.includes(imgKey.toLowerCase()));
}

// Recursively filter out image URLs from an object
function filterConfigData(obj: unknown, depth = 0): unknown {
  if (depth > 10) return obj; // Prevent infinite recursion
  
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => filterConfigData(item, depth + 1));
  }
  
  if (typeof obj === 'object') {
    const filtered: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      // Skip image-related keys
      if (shouldExcludeKey(key)) {
        // For image keys, just note that they exist but don't include the value
        if (value) {
          filtered[key] = '[Image URL - not included in export]';
        }
        continue;
      }
      filtered[key] = filterConfigData(value, depth + 1);
    }
    return filtered;
  }
  
  return obj;
}

// Fetch all section data from the database
async function fetchAllSectionData() {
  const [
    hero,
    mission,
    population,
    financial,
    method,
    curriculum,
    impactSection,
    hearOurImpact,
    testimonials,
    nationalImpact,
    flexA,
    flexB,
    flexC,
    impactLevels,
    partners,
    footer,
    defaults,
  ] = await Promise.all([
    fetchHeroContent(),
    fetchMissionContent(),
    fetchPopulationContent(),
    fetchFinancialContent(),
    fetchMethodContent(),
    fetchCurriculumContent(),
    fetchImpactSectionContent(),
    fetchHearOurImpactContent(),
    fetchTestimonialsContent(),
    fetchNationalImpactContent(),
    fetchFlexAContent(),
    fetchFlexBContent(),
    fetchFlexCContent(),
    fetchImpactLevelsContent(),
    fetchPartnersContent(),
    fetchFooterContent(),
    fetchDefaults(),
  ]);

  return {
    defaults,
    hero,
    mission,
    population,
    financial,
    method,
    curriculum,
    impactSection,
    hearOurImpact,
    testimonials,
    nationalImpact,
    flexA,
    flexB,
    flexC,
    impactLevels,
    partners,
    footer,
  };
}

// Add a page of text content to the PDF
function addTextPage(
  pdf: jsPDF,
  title: string,
  content: string,
  isFirstPage: boolean = false
) {
  if (!isFirstPage) {
    pdf.addPage();
  }
  
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const lineHeight = 5;
  const maxWidth = pageWidth - margin * 2;
  
  // Title
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text(title, margin, margin + 10);
  
  // Content
  pdf.setFontSize(9);
  pdf.setFont('courier', 'normal');
  
  const lines = content.split('\n');
  let y = margin + 25;
  
  for (const line of lines) {
    // Check if we need a new page
    if (y + lineHeight > pageHeight - margin) {
      pdf.addPage();
      y = margin + 10;
    }
    
    // Handle long lines by wrapping
    if (line.length > 0) {
      const wrappedLines = pdf.splitTextToSize(line, maxWidth);
      for (const wrappedLine of wrappedLines) {
        if (y + lineHeight > pageHeight - margin) {
          pdf.addPage();
          y = margin + 10;
        }
        pdf.text(wrappedLine, margin, y);
        y += lineHeight;
      }
    } else {
      y += lineHeight * 0.5; // Smaller gap for empty lines
    }
  }
}

// Load the full impact report in an iframe and capture it
async function captureFullReportViaIframe(
  pdf: jsPDF,
  onProgress?: (progress: number, status: string) => void
): Promise<void> {
  onProgress?.(5, 'Creating capture frame...');
  
  // Create a hidden iframe to load the full impact report
  const iframe = document.createElement('iframe');
  iframe.style.cssText = `
    position: fixed;
    left: -10000px;
    top: 0;
    width: 1400px;
    height: 900px;
    border: none;
    visibility: hidden;
  `;
  
  // Add parameter to skip intro animation
  iframe.src = '/?skipIntro=true';
  
  document.body.appendChild(iframe);
  
  try {
    onProgress?.(8, 'Loading impact report page...');
    
    // Wait for iframe to load
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Iframe load timeout'));
      }, 30000);
      
      iframe.onload = () => {
        clearTimeout(timeout);
        resolve();
      };
      
      iframe.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('Failed to load impact report page'));
      };
    });
    
    onProgress?.(15, 'Waiting for content to render...');
    
    // Wait for lazy-loaded content and animations to settle
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      throw new Error('Cannot access iframe document');
    }
    
    // Find the main content container
    const mainContent = iframeDoc.querySelector('.impact-report') || iframeDoc.body;
    if (!mainContent) {
      throw new Error('Cannot find impact report content');
    }
    
    onProgress?.(20, 'Preparing for capture...');
    
    // Get the full scrollable content
    const body = iframeDoc.body;
    const html = iframeDoc.documentElement;
    
    // Calculate full page height
    const fullHeight = Math.max(
      body.scrollHeight,
      body.offsetHeight,
      html.clientHeight,
      html.scrollHeight,
      html.offsetHeight
    );
    
    const fullWidth = 1400;
    
    console.log('[PDF Export] Full page dimensions:', { fullWidth, fullHeight });
    
    // Resize iframe to capture full content
    iframe.style.height = `${fullHeight}px`;
    iframe.style.width = `${fullWidth}px`;
    
    // Wait for resize to take effect
    await new Promise(resolve => setTimeout(resolve, 500));
    
    onProgress?.(25, 'Capturing full page (this may take a moment)...');
    
    // Capture the full page in chunks to avoid memory issues
    const chunkHeight = 4000; // Capture in 4000px chunks
    const chunks = Math.ceil(fullHeight / chunkHeight);
    const capturedImages: { canvas: HTMLCanvasElement; yOffset: number }[] = [];
    
    for (let i = 0; i < chunks; i++) {
      const yOffset = i * chunkHeight;
      const captureHeight = Math.min(chunkHeight, fullHeight - yOffset);
      
      onProgress?.(
        25 + ((i + 1) / chunks) * 35,
        `Capturing section ${i + 1} of ${chunks}...`
      );
      
      // Scroll to the position
      iframe.contentWindow?.scrollTo(0, yOffset);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const canvas = await html2canvas(body, {
        scale: 1.2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#0f1118',
        width: fullWidth,
        height: captureHeight,
        x: 0,
        y: yOffset,
        scrollX: 0,
        scrollY: 0,
        windowWidth: fullWidth,
        windowHeight: captureHeight,
        foreignObjectRendering: false,
      });
      
      capturedImages.push({ canvas, yOffset });
    }
    
    onProgress?.(65, 'Assembling PDF pages...');
    
    // Combine all chunks into a single tall canvas
    const combinedCanvas = document.createElement('canvas');
    combinedCanvas.width = fullWidth * 1.2;
    combinedCanvas.height = fullHeight * 1.2;
    
    const ctx = combinedCanvas.getContext('2d');
    if (!ctx) {
      throw new Error('Cannot create canvas context');
    }
    
    // Fill background
    ctx.fillStyle = '#0f1118';
    ctx.fillRect(0, 0, combinedCanvas.width, combinedCanvas.height);
    
    // Draw each chunk
    for (const { canvas, yOffset } of capturedImages) {
      ctx.drawImage(canvas, 0, yOffset * 1.2);
    }
    
    // Now slice into PDF pages
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    const scaleFactor = pageWidth / combinedCanvas.width;
    const scaledPageHeight = pageHeight / scaleFactor;
    const totalPages = Math.ceil(combinedCanvas.height / scaledPageHeight);
    
    console.log('[PDF Export] Creating', totalPages, 'PDF pages');
    
    for (let i = 0; i < totalPages; i++) {
      onProgress?.(
        65 + ((i + 1) / totalPages) * 30,
        `Creating PDF page ${i + 1} of ${totalPages}...`
      );
      
      const sourceY = i * scaledPageHeight;
      const sourceHeight = Math.min(scaledPageHeight, combinedCanvas.height - sourceY);
      
      // Create page slice canvas
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = combinedCanvas.width;
      pageCanvas.height = Math.ceil(sourceHeight);
      
      const pageCtx = pageCanvas.getContext('2d');
      if (!pageCtx) continue;
      
      pageCtx.fillStyle = '#0f1118';
      pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      
      pageCtx.drawImage(
        combinedCanvas,
        0, sourceY, combinedCanvas.width, sourceHeight,
        0, 0, pageCanvas.width, sourceHeight
      );
      
      const imgData = pageCanvas.toDataURL('image/jpeg', 0.9);
      
      if (i > 0) {
        pdf.addPage();
      }
      
      const pdfImgHeight = sourceHeight * scaleFactor;
      pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pdfImgHeight);
    }
    
  } finally {
    // Clean up iframe
    document.body.removeChild(iframe);
  }
}

export interface PdfExportOptions {
  year?: string;
  onProgress?: (progress: number, status: string) => void;
}

/**
 * Export the impact report as a PDF
 * 
 * @param _previewElement - (Deprecated) Not used, kept for API compatibility
 * @param options - Export options including year label and progress callback
 * @returns Promise that resolves when PDF is downloaded
 */
export async function exportImpactReportPDF(
  _previewElement: HTMLElement | null,
  options: PdfExportOptions = {}
): Promise<void> {
  const { year = 'Impact Report', onProgress } = options;
  
  // Create PDF in portrait mode, letter size
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter',
  });
  
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  // Add title page
  pdf.setFontSize(28);
  pdf.setFont('helvetica', 'bold');
  pdf.text('GOGO Impact Report', pageWidth / 2, 60, { align: 'center' });
  
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'normal');
  pdf.text(year, pageWidth / 2, 75, { align: 'center' });
  
  pdf.setFontSize(12);
  pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 90, { align: 'center' });
  
  pdf.setFontSize(10);
  pdf.setTextColor(100);
  pdf.text('This document contains the impact report as displayed on the web,', pageWidth / 2, 120, { align: 'center' });
  pdf.text('followed by a full dump of all customization settings.', pageWidth / 2, 127, { align: 'center' });
  pdf.setTextColor(0);
  
  // Capture the full impact report via iframe
  onProgress?.(2, 'Starting full report capture...');
  
  pdf.addPage();
  
  try {
    await captureFullReportViaIframe(pdf, (progress, status) => {
      onProgress?.(2 + (progress / 100) * 48, status);
    });
  } catch (error) {
    console.error('[PDF Export] Error capturing full report:', error);
    // Add an error note
    pdf.setFontSize(12);
    pdf.setTextColor(100);
    pdf.text('Unable to capture the full visual report.', 20, 30);
    pdf.text('This may be due to CORS restrictions on images.', 20, 42);
    pdf.text('Please view the impact report directly in your browser.', 20, 54);
    if (error instanceof Error) {
      pdf.setFontSize(9);
      pdf.text(`Technical details: ${error.message}`, 20, 70);
    }
    pdf.setTextColor(0);
  }
  
  // Fetch all configuration data
  onProgress?.(52, 'Fetching configuration data from database...');
  
  let allData;
  try {
    allData = await fetchAllSectionData();
  } catch (error) {
    console.error('[PDF Export] Error fetching configuration data:', error);
    pdf.addPage();
    pdf.setFontSize(12);
    pdf.text('Unable to fetch configuration data.', 20, 30);
    pdf.save(`GOGO-Impact-Report-${year.replace(/\s+/g, '-')}.pdf`);
    return;
  }
  
  onProgress?.(65, 'Processing configuration data...');
  
  // Filter out image URLs from the data
  const filteredData = filterConfigData(allData);
  
  // Add configuration dump section header
  pdf.addPage();
  pdf.setFontSize(22);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Configuration Data Dump', 20, 30);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100);
  pdf.text('Full customization options from MongoDB (image URLs excluded)', 20, 42);
  pdf.text(`Report Year: ${year}`, 20, 52);
  pdf.text(`Generated: ${new Date().toISOString()}`, 20, 62);
  pdf.setTextColor(0);
  
  onProgress?.(70, 'Generating configuration pages...');
  
  // Add each section's data as separate pages
  const sections = Object.entries(filteredData as Record<string, unknown>);
  const totalSections = sections.length;
  
  for (let i = 0; i < sections.length; i++) {
    const [sectionName, sectionData] = sections[i];
    
    onProgress?.(
      70 + ((i + 1) / totalSections) * 25,
      `Adding ${sectionName} configuration...`
    );
    
    if (sectionData === null || sectionData === undefined) {
      continue; // Skip null sections
    }
    
    const formattedJson = JSON.stringify(sectionData, null, 2);
    const sectionTitle = sectionName.charAt(0).toUpperCase() + sectionName.slice(1);
    
    addTextPage(pdf, `Section: ${sectionTitle}`, formattedJson, false);
  }
  
  onProgress?.(97, 'Saving PDF...');
  
  // Download the PDF
  const filename = `GOGO-Impact-Report-${year.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(filename);
  
  onProgress?.(100, 'Complete!');
}

export default exportImpactReportPDF;
