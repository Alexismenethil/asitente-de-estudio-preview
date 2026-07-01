"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useAppState } from "@/context/AppStateContext";
import { DocumentIcon, ZoomInIcon, ZoomOutIcon } from "@/components/icons";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

function IconButton({ children, onClick, label }: { children: ReactNode; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex h-9 w-9 items-center justify-center rounded-full text-[#a9b2c8] transition-all duration-300 ease-[var(--premium-ease)] hover:-translate-y-0.5 hover:bg-[#eef1f6] hover:text-[#6b7280] active:scale-[0.94]"
    >
      {children}
    </button>
  );
}

export default function PdfViewer() {
  const { clearTargetPage, currentPage, pdfFile, setCurrentPage, setTotalPages, targetPage, totalPages } = useAppState();
  const [numPages, setNumPages] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [containerWidth, setContainerWidth] = useState(0);
  const pageRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const viewerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (targetPage && pageRefs.current[targetPage]) {
      pageRefs.current[targetPage]?.scrollIntoView({ behavior: "smooth", block: "start" });
      clearTargetPage();
    }
  }, [clearTargetPage, targetPage]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || typeof ResizeObserver === "undefined") return;

    setContainerWidth(viewer.clientWidth);

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setContainerWidth(entry.contentRect.width);
    });

    observer.observe(viewer);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || numPages === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visibleEntry) return;

        const page = Number((visibleEntry.target as HTMLDivElement).dataset.page);
        if (!Number.isNaN(page)) setCurrentPage(page);
      },
      {
        root: viewer,
        threshold: [0.35, 0.5, 0.7],
        rootMargin: "-12% 0px -42% 0px",
      }
    );

    Object.values(pageRefs.current).forEach((pageRef) => {
      if (pageRef) observer.observe(pageRef);
    });

    return () => observer.disconnect();
  }, [numPages, pdfFile, setCurrentPage]);

  if (!pdfFile) return null;

  const availableWidth = Math.max(300, containerWidth - 56);
  const pageWidth = Math.round(Math.min(availableWidth, 820) * zoom);

  return (
    <section className="mx-auto flex h-full max-w-[1420px] flex-col overflow-hidden rounded-[22px] bg-white shadow-[0_24px_70px_rgba(31,35,45,0.1)]">
      <header className="flex min-h-[72px] items-center justify-between gap-4 border-b border-[#f0eee9] px-5 sm:px-7">
        <div className="flex min-w-0 items-center gap-3">
          <DocumentIcon className="h-6 w-6 shrink-0 text-[#7b8394]" />
          <p className="truncate text-[16px] font-medium text-[#4e5565]">{pdfFile.name}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <p className="hidden text-[15px] text-[#b3bbce] sm:block">
            Pagina {currentPage} de {totalPages || "--"}
          </p>
          <IconButton label="Alejar" onClick={() => setZoom((prev) => Math.max(0.8, Number((prev - 0.1).toFixed(2))))}>
            <ZoomOutIcon className="h-5 w-5" />
          </IconButton>
          <IconButton label="Acercar" onClick={() => setZoom((prev) => Math.min(1.6, Number((prev + 0.1).toFixed(2))))}>
            <ZoomInIcon className="h-5 w-5" />
          </IconButton>
        </div>
      </header>

      <div ref={viewerRef} className="soft-scrollbar flex-1 overflow-auto bg-[#f8f5ef] px-4 pb-28 pt-8 sm:px-7">
        <Document
          file={pdfFile}
          onLoadSuccess={({ numPages: total }) => {
            setNumPages(total);
            setTotalPages(total);
            setCurrentPage(1);
          }}
          loading={<p className="pt-10 text-center text-sm text-[#8f96a6]">Cargando PDF...</p>}
          error={<p className="pt-10 text-center text-sm text-red-600">No se pudo cargar el PDF.</p>}
        >
          {Array.from({ length: numPages }, (_, index) => {
            const pageNumber = index + 1;

            return (
              <div
                key={pageNumber}
                data-page={pageNumber}
                ref={(el) => {
                  pageRefs.current[pageNumber] = el;
                }}
                className="page-in mb-7 flex justify-center last:mb-0"
                style={{ animationDelay: `${Math.min(index * 45, 240)}ms` }}
              >
                <Page pageNumber={pageNumber} width={pageWidth} />
              </div>
            );
          })}
        </Document>
      </div>
    </section>
  );
}
