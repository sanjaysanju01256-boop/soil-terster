
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generatePdf = async (element: HTMLElement, fileName: string): Promise<void> => {
  try {
    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      useCORS: true, 
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`${fileName}.pdf`);
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Sorry, there was an error creating the PDF report.");
  }
};


export const shareReport = async (element: HTMLElement, fileName: string): Promise<void> => {
  if (!navigator.share) {
    alert("Sharing is not supported on your browser.");
    return;
  }
  
  try {
    const canvas = await html2canvas(element, { scale: 2 });
    canvas.toBlob(async (blob) => {
        if (blob) {
            const file = new File([blob], `${fileName}.png`, { type: 'image/png' });
            await navigator.share({
                title: 'Soil Test Report',
                text: `Here is the soil test report for ${fileName}.`,
                files: [file],
            });
        }
    }, 'image/png');

  } catch (error) {
      console.error("Error sharing report:", error);
      alert("Could not share the report.");
  }
};
