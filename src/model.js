import fs from "fs";
import { PdfReader } from "pdfreader";
import { PDFDocument } from "pdf-lib";

// Function to read PDF file and extract tracking numbers
function readFilePdf(inputPDFPath) {
    return new Promise((resolve, reject) => {
        const trackingNumbers = []; // Array to store tracking numbers
        new PdfReader().parseFileItems(
            inputPDFPath,
            (err, item) => {
                if (err) {
                    reject(err);
                } else if (!item) {
                    if (trackingNumbers.length === 0) {
                        reject("No tracking numbers found.");
                    }
                    resolve(trackingNumbers);
                } else if (item.text) {
                    const match = item.text.match(/\b\d{4} \d{4} \d{4} \d{4} \d{4} \d{2}\b/);
                    if (match) {
                        const trackingNumber = match[0];
                        console.log("Tracking number:", trackingNumber);
                        trackingNumbers.push(trackingNumber);
                    }
                }
            }
        );
    });
}


// Function to create a new PDF file
async function createNewPDF(trackingNumber, inputPDFPath, outputDir, pageIndex) {
    const outputFilePath = `${outputDir}/${trackingNumber}_page_${pageIndex}.pdf`;

    const inputData = fs.readFileSync(inputPDFPath);
    const pdfDoc = await PDFDocument.load(inputData);

    // Create a new PDF document
    const newPDFDoc = await PDFDocument.create();
    const [copiedPage] = await newPDFDoc.copyPages(pdfDoc, [pageIndex]); // Copy the specified page
    newPDFDoc.addPage(copiedPage);

    // Save the new PDF document to a file
    const newPDFBytes = await newPDFDoc.save();
    fs.writeFileSync(outputFilePath, newPDFBytes);

    console.log(`New PDF file created: ${outputFilePath}`);
    return outputFilePath;
}


// Function to split PDF into individual files
export async function splitPDF(inputPDFPath, outputDir) {
    try {
        console.log(outputDir);
        const trackingNumbers = await readFilePdf(inputPDFPath);
        if (!trackingNumbers || trackingNumbers.length === 0) {
            throw new Error("No tracking numbers found.");
        }

        const inputData = fs.readFileSync(inputPDFPath);
        const pdfDoc = await PDFDocument.load(inputData);
        const pageCount = pdfDoc.getPageCount();

        const filePaths = []; // Array to store the paths of the newly created PDF files

        for (let i = 0; i < pageCount; i++) {
            const trackingNumber = trackingNumbers[i];
            await createNewPDF(trackingNumber, inputPDFPath, outputDir, i);
            filePaths.push(trackingNumber); // Add the path to the array
        }
        return filePaths; // Return the array of file paths
    } catch (error) {
        console.error("Error:", error);
    }
}
