export type ContactsBulkImportStep = "upload" | "match" | "import";

export type BulkImportHistoryRow = {
  id: string;
  fileName: string;
  rowSummary: string;
  uploadedOn: string;
  uploadedBy: string;
};

export type BulkImportMatchRow = {
  id: string;
  matched: boolean;
  spreadsheetColumn: string;
  sampleData: string;
  contactField: string;
};
