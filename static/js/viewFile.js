document.addEventListener('DOMContentLoaded', function() {
    const url = window.location.href;
    new QRCode(document.getElementById("qrcode"), {
        text: url,
        width: 128,
        height: 128
    });

    const documentViewer = document.getElementById('documentViewer');
    documentViewer.style.display = 'block';

    documentViewer.onerror = function() {
        handleIframeError();
    };

    // Change button text for small width devices
    if (window.innerWidth <= 768) {
        const viewAttachmentButton = document.getElementById('viewAttachmentButton');
        viewAttachmentButton.textContent = 'Download Document';
    }
});

function copyLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        alert('Link copied to clipboard');
    }).catch(err => {
        console.error('Error copying link: ', err);
    });
}

function shareQRCode() {
    const qrCodeElement = document.getElementById('qrcode').querySelector('img');
    const url = window.location.href;
    const trackingNo = document.querySelector('p strong').textContent.trim(); // Assuming the tracking number is in a <p> with a <strong> tag

    if (qrCodeElement) {
        const qrCodeUrl = qrCodeElement.src;
        fetch(qrCodeUrl)
            .then(res => res.blob())
            .then(blob => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const img = new Image();
                img.src = URL.createObjectURL(blob);
                img.onload = () => {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    canvas.toBlob((blob) => {
                        const file = new File([blob], 'qrcode.jpg', { type: 'image/jpeg' });
                        const shareData = {
                            title: `QR Code and Link for Document ${trackingNo}`,
                            text: `This is the QR code and link for the document (Tracking No: ${trackingNo}).\n\nLink: ${url}`,
                            files: [file]
                        };

                        if (navigator.canShare && navigator.canShare({ files: [file] })) {
                            navigator.share(shareData).then(() => {
                                console.log('QR Code and link shared successfully');
                            }).catch(err => {
                                console.error('Error sharing QR Code and link: ', err);
                            });
                        } else {
                            alert('Sharing not supported in this browser.');
                        }
                    }, 'image/jpeg');
                };
            })
            .catch(err => {
                console.error('Error fetching QR Code image: ', err);
            });
    } else {
        alert('QR Code not found');
    }
}

function reloadDocument() {
    const documentViewer = document.getElementById('documentViewer');
    documentViewer.src = documentViewer.src;
    documentViewer.style.display = 'block';
    document.getElementById('reloadButton').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'none';
}

function handleIframeError() {
    const documentViewer = document.getElementById('documentViewer');
    documentViewer.style.display = 'none';
    document.getElementById('reloadButton').style.display = 'block';
    document.getElementById('errorMessage').style.display = 'block';
}

function viewAttachment(trackingNo) {
    fetch(`/document_details?tracking_no=${trackingNo}`)
        .then(response => response.json())
        .then(data => {
            const fileExtension = '.pdf'; // Adjust the file extension as needed
            const formattedOffice = data.sender_office.replace(/\s+/g, '_');
            const formattedSection = data.sender_section.replace(/\s+/g, '_');
            const filename = `${trackingNo}_${formattedOffice}_${formattedSection}${fileExtension}`;
            const fileUrl = `http://localhost:5000/file_server/${filename}`;
            
            if (window.innerWidth <= 768) {
                // Download the file for small width devices
                const link = document.createElement('a');
                link.href = fileUrl;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                // Open the file in a new tab for other devices
                window.open(fileUrl, '_blank');
            }
        })
        .catch(error => console.error('Error:', error));
}

function closeDocumentViewer() {
    const documentViewer = document.getElementById('documentViewer');
    documentViewer.style.display = 'none';
    documentViewer.style.position = 'static';
    documentViewer.style.width = '100%';
    documentViewer.style.height = '600px';
    documentViewer.style.zIndex = 'auto';
    document.getElementById('closeViewerButton').style.display = 'none';
}
