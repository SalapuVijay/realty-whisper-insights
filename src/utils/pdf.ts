
// This file re-exports the PDF generation functionality with the correct name
import { generatePropertyReport } from "@/utils/pdfGenerator";

// Re-export the function with the name expected by PropertyAnalysisPanel
export const generatePDF = generatePropertyReport;
