import { Download } from "lucide-react";
import { WindowContorls } from "../components/imports";
import WindowWrapper from "../hoc/WindowWrapper";

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const Resume = () => {
    return <>
    <div id="window-header">
        <WindowContorls target="resume"/>
        <h2>Resume.pdf</h2>

        <a href="../files/Kartik_Resume95.pdf" download className="cursor-pointer" title="Dowload resume">
         <Download className="icon" />
        </a>
    </div>

    <Document file="public/files/Kartik_Resume95.pdf" >
        <Page pageNumber={1}
        renderTextLayer
        renderAnnotationLayer
        
        />
      </Document>
    </>
}

const ResumeWindow = WindowWrapper(Resume, "resume");

export default ResumeWindow;
