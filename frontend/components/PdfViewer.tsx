"use client";

import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useAppState } from "@/context/AppStateContext";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export default function PdfViewer() {
  const { pdfFile, targetPage } = useAppState();
  const [numPages, setNumPages] = useState(0);
  const pageRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    if (targetPage && pageRefs.current[targetPage]) {
      pageRefs.current[targetPage]?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [targetPage]);

  if (!pdfFile) return null;

  return (
    <div className="h-full overflow-y-auto bg-gray-100 p-4">
      <Document
        file={pdfFile}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        loading={<p className="text-center text-gray-500">Cargando PDF...</p>}
      >
        {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNumber) => (
          <div
            key={pageNumber}
            ref={(el) => {
              pageRefs.current[pageNumber] = el;
            }}
            className="mb-4 flex justify-center"
          >
            <Page pageNumber={pageNumber} width={700} />
          </div>
        ))}
      </Document>
    </div>
  );
}
