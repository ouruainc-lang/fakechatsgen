import { toPng, toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';

export const exportToPng = async (element, fileName, scale = 2) => {
    try {
        const dataUrl = await toPng(element, {
            cacheBust: true,
            pixelRatio: scale,
            style: { transform: 'scale(1)', margin: 0 }
        });
        const link = document.createElement('a');
        link.download = `${fileName}.png`;
        link.href = dataUrl;
        link.click();
    } catch (err) {
        console.error('Failed to export image', err);
    }
};

export const exportToJpeg = async (element, fileName, scale = 2) => {
    try {
        const dataUrl = await toJpeg(element, {
            quality: 0.95,
            cacheBust: true,
            pixelRatio: scale,
            style: { transform: 'scale(1)', margin: 0 }
        });
        const link = document.createElement('a');
        link.download = `${fileName}.jpg`;
        link.href = dataUrl;
        link.click();
    } catch (err) {
        console.error('Failed to export image', err);
    }
};

export const exportToPdf = async (nodeId, fileName = 'chat-export') => {
    const node = document.getElementById(nodeId);
    if (!node) return;

    try {
        const dataUrl = await toPng(node, { pixelRatio: 2 });
        const imgProps = { width: node.offsetWidth, height: node.offsetHeight };

        // A4 size standard roughly, but we might want to just fit the image
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: [imgProps.width, imgProps.height]
        });

        pdf.addImage(dataUrl, 'PNG', 0, 0, imgProps.width, imgProps.height);
        pdf.save(`${fileName}.pdf`);
    } catch (error) {
        console.error('Error exporting PDF', error);
    }
};
