let lastMessageTime = 0;

function toggleMenu() {
    const menu = document.getElementById('slidingMenu');
    const content = document.getElementById('content');
    menu.classList.toggle('open');
    content.classList.toggle('shift-right');
}

function toggleNotificationsModal() {
    const modal = document.getElementById('notificationsModal');
    modal.classList.toggle('open');
    modal.classList.add('animate');
    setTimeout(() => modal.classList.remove('animate'), 500);
}

function closeModal(event) {
    if (event.target === document.getElementById('notificationsModal')) {
        toggleNotificationsModal();
    }
}

function displayNotification(details) {
    const detailsDiv = document.getElementById('notificationDetails');
    detailsDiv.textContent = details;
}

function toggleNotifications() {
    toggleNotificationsModal();
}

function toggleSearch() {
    const searchBar = document.getElementById('searchBar');
    searchBar.classList.toggle('open');
    searchBar.classList.add('animate');
    setTimeout(() => searchBar.classList.remove('animate'), 500);
}

function performSearch() {
    const query = document.querySelector('#searchBar input').value.toLowerCase();
    const category = document.querySelector('#searchCategory').value;
    const rows = document.querySelectorAll('#documentTable tbody tr');

    rows.forEach(row => {
        const cell = row.querySelector(`td:nth-child(${getCategoryIndex(category)})`).textContent.toLowerCase();
        if (cell.includes(query)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function getCategoryIndex(category) {
    switch (category) {
        case 'tracking_no':
            return 1;
        case 'document_type':
            return 2;
        case 'subject':
            return 4;
        case 'receiving_office':
            return 6;  // Changed variable name
        default:
            return 1;
    }
}

function printPage() {
    window.print();
}

function toggleChat() {
    const chatbox = document.getElementById('chatbox');
    chatbox.classList.toggle('open');
    chatbox.classList.add('animate');
    setTimeout(() => chatbox.classList.remove('animate'), 500);
}

function formatTimestamp(date) {
    return date.toLocaleString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value;
    if (message.trim() !== "") {
        const messagesContainer = document.getElementById('chatboxMessages');
        const messageElement = document.createElement('div');
        const currentTime = new Date().getTime();
        const timestamp = formatTimestamp(new Date());
        messageElement.classList.add('chatbox-message', 'sent');
        messageElement.innerHTML = `<span>${message}</span>`;
        if (currentTime - lastMessageTime > 300000) { // 5 minutes
            const timestampElement = document.createElement('small');
            timestampElement.classList.add('timestamp');
            timestampElement.textContent = timestamp;
            messagesContainer.appendChild(timestampElement);
        }
        messagesContainer.appendChild(messageElement);
        input.value = "";
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        lastMessageTime = currentTime;
    }
}

function toggleFloatingMenu() {
    const floatingMenu = document.getElementById('floatingMenu');
    const floatingButton = document.querySelector('.floating-button');
    floatingMenu.classList.toggle('open');
    floatingButton.classList.toggle('open');
    floatingMenu.classList.add('animate');
    setTimeout(() => floatingMenu.classList.remove('animate'), 500);
}

function updateDateTime() {
    fetch('https://timeapi.io/api/Time/current/zone?timeZone=Asia/Manila')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const now = new Date(data.dateTime);
            const options = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit',
                hour12: true 
            };
            const formattedDateTime = now.toLocaleDateString('en-US', options);
            document.getElementById('datetime').textContent = formattedDateTime;
        })
        .catch(error => {
            console.error('Error fetching time:', error);
            // Fallback to local time if the API request fails
            const now = new Date();
            const options = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit',
                hour12: true 
            };
            const formattedDateTime = now.toLocaleDateString('en-US', options);
            document.getElementById('datetime').textContent = formattedDateTime;
        });
}

setInterval(updateDateTime, 1000);
document.addEventListener('DOMContentLoaded', updateDateTime);

// Simulate receiving a message
setTimeout(() => {
    const messagesContainer = document.getElementById('chatboxMessages');
    const messageElement = document.createElement('div');
    const timestamp = formatTimestamp(new Date());
    messageElement.classList.add('chatbox-message', 'received');
    messageElement.innerHTML = `<span>Hello! How can I help you?</span>`;
    const timestampElement = document.createElement('small');
    timestampElement.classList.add('timestamp');
    timestampElement.textContent = timestamp;
    messagesContainer.appendChild(timestampElement);
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}, 2000);

function checkSimpleDocumentTimers() {
    const rows = document.querySelectorAll('#documentTable tbody tr');
    const expiredDocuments = [];
    rows.forEach(row => {
        const status = row.querySelector('td:nth-child(9)').textContent.trim(); // Updated to correct column
        const category = row.querySelector('td:nth-child(10)').textContent.trim(); // Updated to correct column
        const dateReleasedText = row.querySelector('td:nth-child(5)').textContent.trim();
        const dateReleased = new Date(Date.parse(dateReleasedText));
        const now = new Date();
        const timeDiff = (now - dateReleased) / 1000 / 60 / 60 / 24; // Time difference in days

        if ((status === 'Pending' || status === 'Processing') && category === 'Simple' && timeDiff > 1) { // 1 day
            const trackingNo = row.querySelector('td:nth-child(1)').textContent.trim();
            expiredDocuments.push({ trackingNo, daysOverdue: Math.floor(timeDiff - 1) });
        }
    });

    if (expiredDocuments.length > 0) {
        showExpiredAlertModal(expiredDocuments);
        displayOverdueDocuments(expiredDocuments);
    }
}

function checkTechnicalDocumentTimers() {
    const rows = document.querySelectorAll('#documentTable tbody tr');
    const expiredDocuments = [];
    rows.forEach(row => {
        const status = row.querySelector('td:nth-child(9)').textContent.trim(); // Updated to correct column
        const category = row.querySelector('td:nth-child(10)').textContent.trim(); // Updated to correct column
        const dateReleasedText = row.querySelector('td:nth-child(5)').textContent.trim();
        const dateReleased = new Date(Date.parse(dateReleasedText));
        const now = new Date();
        const timeDiff = (now - dateReleased) / 1000 / 60 / 60 / 24; // Time difference in days

        if ((status === 'Pending' || status === 'Processing') && category === 'Technical' && timeDiff > 4) { // 4 days
            const trackingNo = row.querySelector('td:nth-child(1)').textContent.trim();
            expiredDocuments.push({ trackingNo, daysOverdue: Math.floor(timeDiff - 4) });
        }
    });

    if (expiredDocuments.length > 0) {
        showExpiredAlertModal(expiredDocuments);
        displayOverdueDocuments(expiredDocuments);
    }
}

function checkHighlyTechnicalDocumentTimers() {
    const rows = document.querySelectorAll('#documentTable tbody tr');
    const expiredDocuments = [];
    rows.forEach(row => {
        const status = row.querySelector('td:nth-child(9)').textContent.trim(); // Updated to correct column
        const category = row.querySelector('td:nth-child(10)').textContent.trim(); // Updated to correct column
        const dateReleasedText = row.querySelector('td:nth-child(5)').textContent.trim();
        const dateReleased = new Date(Date.parse(dateReleasedText));
        const now = new Date();
        const timeDiff = (now - dateReleased) / 1000 / 60 / 60 / 24; // Time difference in days

        if ((status === 'Pending' || status === 'Processing') && category === 'Highly Technical' && timeDiff > 15) { // 15 days
            const trackingNo = row.querySelector('td:nth-child(1)').textContent.trim();
            expiredDocuments.push({ trackingNo, daysOverdue: Math.floor(timeDiff - 15) });
        }
    });

    if (expiredDocuments.length > 0) {
        showExpiredAlertModal(expiredDocuments);
        displayOverdueDocuments(expiredDocuments);
    }
}

function displayOverdueDocuments(expiredDocuments) {
    const rows = document.querySelectorAll('#documentTable tbody tr');
    rows.forEach(row => {
        const trackingNo = row.querySelector('td:nth-child(1)').textContent.trim();
        if (expiredDocuments.some(doc => doc.trackingNo === trackingNo)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('fade-in');
    const notificationsModal = document.getElementById('notificationsModal');
    notificationsModal.classList.remove('open');

    const currentPage = window.location.pathname;
    if (currentPage.includes('incoming_documents')) {
        updateDateTime(); // Ensure datetime is updated first
        setTimeout(() => {
            checkSimpleDocumentTimers();
            checkTechnicalDocumentTimers();
            checkHighlyTechnicalDocumentTimers();
        }, 1000); // Delay the check functions to ensure datetime is updated
        setInterval(() => {
            checkSimpleDocumentTimers();
            checkTechnicalDocumentTimers();
            checkHighlyTechnicalDocumentTimers();
        }, 300000); // Refresh every 300 seconds / 5 minutes
    }
});

function toggleNewDocumentModal() {
    const modal = document.getElementById('newDocumentModal');
    modal.classList.toggle('open');
    modal.classList.add('animate');
    setTimeout(() => modal.classList.remove('animate'), 500);

    // Removed call to generateTrackingNo
}

function generateTrackingNo() {
    const currentYear = new Date().getFullYear();
    const lastId = Math.floor(Math.random() * 100000); // Simulate last ID for demonstration
    const trackingNo = `TN-${currentYear}-${lastId + 1}`;
    // Removed setting textContent for tracking number display
}

function toggleSuccessDialog() {
    const dialog = document.getElementById('successDialog');
    dialog.classList.toggle('open');
    dialog.classList.add('animate');
    setTimeout(() => dialog.classList.remove('animate'), 500);
}

document.getElementById('newDocumentForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const submitButton = this.querySelector('button[type="submit"]');
    submitButton.disabled = true; // Disable the button

    // Show the adding document modal
    const addingDocumentModal = document.getElementById('addingDocumentModal');
    addingDocumentModal.classList.add('open');

    // Show notification
    alert('Adding document, please wait...');

    const formData = new FormData(this);
    fetch('/add_document', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            toggleNewDocumentModal();
            toggleSuccessDialog();
            setTimeout(() => {
                location.reload();
            }, 2000);
        } else {
            alert('Failed to add document');
            submitButton.disabled = false; // Re-enable the button
            addingDocumentModal.classList.remove('open'); // Hide the adding document modal
        }
    })
    .catch(error => {
        console.error('Error:', error);
        submitButton.disabled = false; // Re-enable the button
        addingDocumentModal.classList.remove('open'); // Hide the adding document modal
    });
});

function showExpiredAlertModal(expiredDocuments) {
    const overlay = document.getElementById('expiredAlertOverlay');
    const notification = document.getElementById('expiredAlertModal');
    const notificationContent = document.querySelector('.notification-content');
    overlay.classList.add('show');
    notification.classList.add('show');

    let overdueMessage = '';
    expiredDocuments.forEach(doc => {
        overdueMessage += `<p>Tracking No: <span class="overdue-message">${doc.trackingNo}</span> - Overdue by ${doc.daysOverdue} day(s)</p>`;
    });

    notificationContent.innerHTML = `
        <p>You have Documents that need your attention!</p>
        <div class="scrollable-content">
            ${overdueMessage}
        </div>
        <button id="viewExpiredDocumentsButton" onclick="viewExpiredDocuments()">View Documents</button>
    `;
}

function viewExpiredDocuments() {
    const overlay = document.getElementById('expiredAlertOverlay');
    const notification = document.getElementById('expiredAlertModal');
    overlay.classList.remove('show');
    notification.classList.remove('show');

    const expiredTrackingNos = Array.from(document.querySelectorAll('.overdue-message')).map(el => el.textContent.trim());
    const rows = document.querySelectorAll('#documentTable tbody tr');
    rows.forEach(row => {
        const trackingNo = row.querySelector('td:nth-child(1)').textContent.trim();
        if (expiredTrackingNos.includes(trackingNo)) {
            row.style.backgroundColor = 'red';
        }
    });
}

function viewDocument(trackingNo) {
    fetch(`/document_details?tracking_no=${trackingNo}`)
        .then(response => response.json())
        .then(data => {
            const documentDetails = document.getElementById('documentDetails');
            documentDetails.innerHTML = `
                <h2>Document Details</h2>
                <p><strong>Tracking No:</strong> ${data.tracking_no}</p>
                <p><strong>Document Type:</strong> ${data.document_type}</p>
                <p><strong>Document Properties:</strong> ${data.document_properties}</p>
                <p><strong>Subject:</strong> ${data.subject}</p>
                <p><strong>Date Released:</strong> ${new Date(data.date_released).toLocaleString()}</p>
                <p><strong>Receiving Office:</strong> ${data.receiving_office}</p> <!-- Changed variable name -->
                <p><strong>Receiving Section:</strong> ${data.receiving_section}</p> <!-- New field -->
                <p><strong>Status:</strong> ${data.status}</p>
                <p><strong>Document Category:</strong> ${data.document_category}</p>
                <div class="modal-actions">
                    <button class="view-attachment-button" onclick="viewAttachment('${data.tracking_no}')">View Attachment</button>
                    <button class="send-to-button" onclick="sendTo()">Send To</button>
                    <button class="mark-processed-button" onclick="markAsProcessed()">Mark as Processed</button>
                </div>
            `;
            toggleViewDocumentModal(true);
            const notification = document.getElementById('expiredAlertModal');
            const overlay = document.getElementById('expiredAlertOverlay');
            notification.classList.remove('show');
            overlay.classList.remove('show');

            // Show or hide the "Send To" and "Mark as Processed" buttons based on the page and user section
            const currentPage = window.location.pathname;
            const sendToButton = document.querySelector('.send-to-button');
            const markProcessedButton = document.querySelector('.mark-processed-button');
            const userSection = document.querySelector('.username').textContent.split(' ')[0];

            if (currentPage.includes('incoming_documents') || currentPage.includes('on_process_documents')) {
                sendToButton.style.display = 'inline-block';
                if (userSection === 'RECORDS') {
                    markProcessedButton.style.display = 'inline-block';
                } else {
                    markProcessedButton.style.display = 'none';
                }
            } else {
                sendToButton.style.display = 'none';
                markProcessedButton.style.display = 'none';
            }
        })
        .catch(error => console.error('Error:', error));
}

function toggleViewDocumentModal(open) {
    const modal = document.getElementById('viewDocumentModal');
    if (open) {
        modal.classList.add('open');
    } else {
        modal.classList.remove('open');
    }
}

function updateDocumentStatus(trackingNo, status) {
    fetch(`/update_document_status`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tracking_no: trackingNo, status: status })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Document status updated successfully');
        } else {
            console.error('Failed to update document status');
        }
    })
    .catch(error => console.error('Error:', error));
}

// Ensure the plus icon shows when the screen is small
function checkScreenSize() {
    const floatingButton = document.querySelector('.floating-button');
    const menuIcon = document.querySelector('.menu-icon');
    if (window.innerWidth <= 768) {
        if (floatingButton) {
            floatingButton.style.display = 'block';
        }
        if (menuIcon) {
            menuIcon.style.display = 'none'; // Hide the menu icon
        }
    } else {
        if (floatingButton) {
            floatingButton.style.display = 'none';
        }
        if (menuIcon) {
            menuIcon.style.display = 'block'; // Show the menu icon
        }
    }
}

window.addEventListener('resize', checkScreenSize);
document.addEventListener('DOMContentLoaded', checkScreenSize);

function toggleDocumentsModal() {
    const modal = document.getElementById('documentsModal');
    modal.classList.toggle('open');
}

function toggleIncomingDocuments() {
    // Implement the logic to show incoming documents
    toggleDocumentsModal(); // Close the document modal
}

function toggleOutgoingDocuments() {
    // Implement the logic to show outgoing documents
    toggleDocumentsModal(); // Close the document modal
}

function toggleOnProcessDocuments() {
    // Implement the logic to show on process documents
    toggleDocumentsModal(); // Close the document modal
}

function toggleAllDocuments() {
    // Implement the logic to show all documents
    toggleDocumentsModal(); // Close the document modal
}

document.querySelectorAll('#documentsModal button').forEach(button => {
    button.addEventListener('click', toggleDocumentsModal);
});

let currentPage = 1;
const rowsPerPage = 10;

function updatePagination() {
    const rows = document.querySelectorAll('#documentTable tbody tr');
    const totalPages = Math.ceil(rows.length / rowsPerPage);
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    const firstButton = document.getElementById('firstButton');
    const lastButton = document.getElementById('lastButton');
    const pageNumbers = document.getElementById('pageNumbers');

    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;
    firstButton.disabled = currentPage === 1;
    lastButton.disabled = currentPage === totalPages;

    pageNumbers.innerHTML = '';
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (endPage - startPage < 4) {
        if (startPage === 1) {
            endPage = Math.min(totalPages, startPage + 4);
        } else if (endPage === totalPages) {
            startPage = Math.max(1, endPage - 4);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageNumber = document.createElement('button');
        pageNumber.textContent = i;
        pageNumber.classList.add('page-number');
        if (i === currentPage) {
            pageNumber.classList.add('active');
        }
        pageNumber.addEventListener('click', () => goToPage(i));
        pageNumbers.appendChild(pageNumber);
    }

    rows.forEach((row, index) => {
        row.style.display = (index >= (currentPage - 1) * rowsPerPage && index < currentPage * rowsPerPage) ? '' : 'none';
    });
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        updatePagination();
    }
}

function nextPage() {
    const rows = document.querySelectorAll('#documentTable tbody tr');
    const totalPages = Math.ceil(rows.length / rowsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        updatePagination();
    }
}

function goToPage(page) {
    currentPage = page;
    updatePagination();
}

function firstPage() {
    currentPage = 1;
    updatePagination();
}

function lastPage() {
    const rows = document.querySelectorAll('#documentTable tbody tr');
    const totalPages = Math.ceil(rows.length / rowsPerPage);
    currentPage = totalPages;
    updatePagination();
}

document.addEventListener('DOMContentLoaded', () => {
    updatePagination();
});

function toggleHelp() {
    const helpModal = document.getElementById('helpModal');
    helpModal.classList.toggle('open');
}

function selectRow(row) {
    const selectedRow = document.querySelector('.selected-row');
    if (selectedRow) {
        selectedRow.classList.remove('selected-row');
    }
    row.classList.add('selected-row');
}

function printSelectedDocument() {
    const selectedRow = document.querySelector('.selected-row');
    if (!selectedRow) {
        alert('Please select a document to print.');
        return;
    }

    const trackingNo = selectedRow.querySelector('td:nth-child(1)').textContent.trim();
    const documentType = selectedRow.querySelector('td:nth-child(2)').textContent.trim();
    const documentProperties = selectedRow.querySelector('td:nth-child(3)').textContent.trim();
    const subject = selectedRow.querySelector('td:nth-child(4)').textContent.trim();
    const dateReleased = selectedRow.querySelector('td:nth-child(5)').textContent.trim();
    const dateReceived = selectedRow.querySelector('td:nth-child(6)').textContent.trim();
    const receivingOffice = selectedRow.querySelector('td:nth-child(7)').textContent.trim();
    const senderOffice = selectedRow.querySelector('td:nth-child(8)').textContent.trim();
    const status = selectedRow.querySelector('td:nth-child(9)').textContent.trim();
    const documentCategory = selectedRow.querySelector('td:nth-child(10)').textContent.trim();
    const viewFileUrl = `http://dts-denr-v2.onrender.com/viewFile.html/${trackingNo}`;

    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write('<html><head><title>Print Document</title><style>');
    printWindow.document.write('table { width: 100%; border-collapse: collapse; margin-top: 20px; }');
    printWindow.document.write('th, td { border: 1px solid #000; padding: 8px; text-align: left; vertical-align: middle; }');
    printWindow.document.write('th { background-color: #f2f2f2; }');
    printWindow.document.write('.red-line { border-top: 3px solid red; margin: 20px 0; }');
    printWindow.document.write('.qrcode-container { position: absolute; bottom: 20px; right: 20px; text-align: center; }'); // QR code positioning
    printWindow.document.write('.qrcode-container p { margin: 0; font-size: 12px; }');
    printWindow.document.write('</style></head><body>');
    printWindow.document.write('<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">');
    printWindow.document.write('<img src="/uploads/denr_logo.png" alt="DENR Logo" style="height: 100px;">');
    printWindow.document.write('<div style="text-align: center; flex-grow: 1;">');
    printWindow.document.write('<p>Republic of the Philippines</p>');
    printWindow.document.write('<p><strong>DEPARTMENT OF ENVIRONMENT AND NATURAL RESOURCES</strong></p>');
    printWindow.document.write('<p>' + receivingOffice + ' OFFICE</p>');
    printWindow.document.write('</div>');
    printWindow.document.write('<img src="/uploads/newph_logo.png" alt="NewPH Logo" style="height: 100px;">');
    printWindow.document.write('</div>');
    printWindow.document.write('<div class="red-line"></div>');
    printWindow.document.write('<h2>Document Action Tracking System</h2>');
    printWindow.document.write('<table>');
    printWindow.document.write('<tr><th>Sender</th><td>' + senderOffice + '</td></tr>');
    printWindow.document.write('<tr><th>Subject</th><td>' + subject + '</td></tr>');
    printWindow.document.write('</table>');
    printWindow.document.write('<h3>Routing and Action Info</h3>');
    printWindow.document.write('<table>');
    printWindow.document.write('<tr><th>FROM</th><th>DATE/TIME RECEIVED</th><th>TO/FOR</th><th>DATE/TIME RELEASED</th><th>ACTION REQUIRED.TAKEN REMARKS/STATUS</th><th></th></tr>');
    printWindow.document.write('<tr><td>' + senderOffice + '</td><td>' + dateReceived + '</td><td>' + receivingOffice + '</td><td>' + dateReleased + '</td><td>For Info<br>Action<br>Compliance<br>For Approval or Signature</td><td><input type="checkbox"><br><input type="checkbox"><br><input type="checkbox"><br><input type="checkbox"></td></tr>');
    printWindow.document.write('</table>');
    printWindow.document.write('<div class="qrcode-container"><div id="qrcode"></div><p>Developed by: Jay Lord Diniega</p></div>'); // QR code container with text
    printWindow.document.write('</body></html>');
    printWindow.document.close();

    // Generate QR code
    const qrCodeScript = printWindow.document.createElement('script');
    qrCodeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
    qrCodeScript.onload = function() {
        new printWindow.QRCode(printWindow.document.getElementById("qrcode"), {
            text: viewFileUrl,
            width: 128,
            height: 128
        });
        setTimeout(() => {
            printWindow.print();
        }, 1000); // Increase the delay before the print dialogue shows
    };
    printWindow.document.body.appendChild(qrCodeScript);
}

function toggleProfileModal() {
    const profileModal = document.getElementById('profileModal');
    profileModal.classList.toggle('open');
}

function logout() {
    window.location.href = "{{ url_for('index') }}";
}

function manageProfile() {
    alert('Manage Profile functionality is not implemented yet.');
}

function toggleDocumentsModal() {
    const modal = document.getElementById('documentsModal');
    modal.classList.toggle('open');
}

function toggleIncomingDocuments() {
    // Implement the logic to show incoming documents
}

function toggleOutgoingDocuments() {
    // Implement the logic to show outgoing documents
}

function toggleOnProcessDocuments() {
    // Implement the logic to show on process documents
}

function toggleAllDocuments() {
    // Implement the logic to show all documents
}

function updateDocumentCategory() {
    const documentType = document.getElementById('documentType').value;
    const documentCategory = document.getElementById('documentCategory');
    documentCategory.innerHTML = ''; // Clear existing options

    fetch(`/get_document_categories?document_type=${documentType}`)
        .then(response => response.json())
        .then(data => {
            data.forEach(category => {
                const option = document.createElement('option');
                option.value = category.Level_of_Priority;
                option.textContent = category.Level_of_Priority;
                documentCategory.appendChild(option);
            });
            documentCategory.disabled = false; // Enable the select element
        })
        .catch(error => console.error('Error:', error));
}

function updateReceivingSections() {
    const receivingOffice = document.getElementById('sendToReceivingOffice').value;
    const receivingSection = document.getElementById('sendToReceivingSection');
    receivingSection.innerHTML = ''; // Clear existing options

    fetch(`/get_receiving_sections?office=${receivingOffice}`)
        .then(response => response.json())
        .then(data => {
            data.forEach(section => {
                const option = document.createElement('option');
                option.value = section.section_designation;
                option.textContent = section.section_designation;
                receivingSection.appendChild(option);
            });
            receivingSection.disabled = false; // Enable the select element
        })
        .catch(error => console.error('Error:', error));
}

function viewDocument(trackingNo) {
    fetch(`/document_details?tracking_no=${trackingNo}`)
        .then(response => response.json())
        .then(data => {
            const documentDetails = document.getElementById('documentDetails');
            documentDetails.innerHTML = `
                <h2>Document Details</h2>
                <p><strong>Tracking No:</strong> ${data.tracking_no}</p>
                <p><strong>Document Type:</strong> ${data.document_type}</p>
                <p><strong>Document Properties:</strong> ${data.document_properties}</p>
                <p><strong>Subject:</strong> ${data.subject}</p>
                <p><strong>Date Released:</strong> ${new Date(data.date_released).toLocaleString()}</p>
                <p><strong>Receiving Office:</strong> ${data.receiving_office}</p>
                <p><strong>Receiving Section:</strong> ${data.receiving_section}</p>
                <p><strong>Status:</strong> ${data.status}</p>
                <p><strong>Document Category:</strong> ${data.document_category}</p>
                <div class="modal-actions">
                    <button class="view-attachment-button" onclick="viewAttachment('${data.tracking_no}')">View Attachment</button>
                    <button class="send-to-button" onclick="sendTo()">Send To</button>
                    <button class="mark-processed-button" onclick="markAsProcessed()">Mark as Processed</button>
                </div>
            `;
            toggleViewDocumentModal(true);
            const notification = document.getElementById('expiredAlertModal');
            const overlay = document.getElementById('expiredAlertOverlay');
            notification.classList.remove('show');
            overlay.classList.remove('show');

            // Show or hide the "Send To" and "Mark as Processed" buttons based on the page and user section
            const currentPage = window.location.pathname;
            const sendToButton = document.querySelector('.send-to-button');
            const markProcessedButton = document.querySelector('.mark-processed-button');
            const userSection = document.querySelector('.username').textContent.split(' ')[0];

            if (currentPage.includes('incoming_documents') || currentPage.includes('on_process_documents')) {
                sendToButton.style.display = 'inline-block';
                if (userSection === 'RECORDS') {
                    markProcessedButton.style.display = 'inline-block';
                } else {
                    markProcessedButton.style.display = 'none';
                }
            } else {
                sendToButton.style.display = 'none';
                markProcessedButton.style.display = 'none';
            }
        })
        .catch(error => console.error('Error:', error));
}

function toggleViewDocumentModal(open) {
    const modal = document.getElementById('viewDocumentModal');
    if (open) {
        modal.classList.add('open');
    } else {
        modal.classList.remove('open');
    }
}

function uploadDocument() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf,.doc,.docx,.txt'; // Acceptable file types
    fileInput.onchange = () => {
        const file = fileInput.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('file', file);

            fetch('/upload_document', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Document uploaded successfully');
                } else {
                    alert('Failed to upload document');
                }
            })
            .catch(error => console.error('Error:', error));
        }
    };
    fileInput.click();
}

function handleFileUpload() {
    // Remove the file upload functionality
}

function sendTo() {
    const trackingNo = document.querySelector('#documentDetails p:nth-child(2) strong').nextSibling.textContent.trim();
    const sendToModal = document.getElementById('sendToModal');
    const trackingNoField = document.getElementById('sendToTrackingNo');
    trackingNoField.textContent = trackingNo;
    sendToModal.classList.add('open');
}

function closeSendToModal() {
    const sendToModal = document.getElementById('sendToModal');
    sendToModal.classList.remove('open');
}

function updateReceivingOfficeAndSection() {
    const trackingNo = document.getElementById('sendToTrackingNo').textContent.trim();
    const receivingOffice = document.getElementById('sendToReceivingOffice').value;
    const receivingSection = document.getElementById('sendToReceivingSection').value;
    const fileInput = document.getElementById('updateDocumentFile');
    const file = fileInput.files[0];

    // Show notification
    alert('The document is being updated, please wait...');

    const formData = new FormData();
    formData.append('tracking_no', trackingNo);
    formData.append('receiving_office', receivingOffice);
    formData.append('receiving_section', receivingSection);

    if (file) {
        formData.append('file', file);
    }

    fetch('/update_receiving_office_and_section', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Document was sent successfully');
            closeSendToModal();
        } else {
            alert('Failed to update document');
        }
    })
    .catch(error => console.error('Error:', error));
}

function markAsProcessed() {
    const trackingNo = document.querySelector('#documentDetails p:nth-child(2) strong').nextSibling.textContent.trim();
    updateDocumentStatus(trackingNo, 'Processed');
    alert(`Document with Tracking No: ${trackingNo} marked as processed.`);
    toggleViewDocumentModal();
}

function toggleIframeModal() {
    const iframeModal = document.getElementById('iframeModal');
    iframeModal.classList.toggle('open');
}

function viewAttachment(trackingNo) {
    fetch(`/document_details?tracking_no=${trackingNo}`)
        .then(response => response.json())
        .then(data => {
            const documentViewer = document.getElementById('documentViewer');
            const fileExtension = '.pdf'; // Adjust the file extension as needed
            const formattedOffice = data.sender_office.replace(/\s+/g, '_');
            const formattedSection = data.sender_section.replace(/\s+/g, '_');
            const filename = `${trackingNo}_${formattedOffice}_${formattedSection}${fileExtension}`;
            const fileUrl = `http://localhost:5000/file_server/${filename}`;
            
            // For Android devices, use Google Docs viewer
            if (/Android/i.test(navigator.userAgent)) {
                documentViewer.src = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
            } else {
                documentViewer.src = fileUrl;
            }
            
            toggleIframeModal();
        })
        .catch(error => console.error('Error:', error));
}

document.addEventListener('DOMContentLoaded', () => {
    // Highlight the expired document if the highlight parameter is present in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const highlightTrackingNo = urlParams.get('highlight');
    if (highlightTrackingNo) {
        const rows = document.querySelectorAll('#documentTable tbody tr');
        rows.forEach(row => {
            const trackingNo = row.querySelector('td:nth-child(1)').textContent.trim();
            if (trackingNo === highlightTrackingNo) {
                row.style.backgroundColor = 'red';
            }
        });
    }

    // Add event listeners for double-click on rows
    const rows = document.querySelectorAll('#documentTable tbody tr');
    rows.forEach(row => {
        row.addEventListener('dblclick', (event) => {
            const trackingNo = row.querySelector('td:nth-child(1)').textContent.trim();
            viewDocument(trackingNo);
            event.stopPropagation(); // Prevent triggering other click events
        });
    });

});

function toggleMoreOptionsMenu() {
    const menu = document.getElementById('moreOptionsMenu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

// Close the menu when clicking outside of it
window.onclick = function(event) {
    if (!event.target.matches('.nav-icon')) {
        const menu = document.getElementById('moreOptionsMenu');
        if (menu.style.display === 'block') {
            menu.style.display = 'none';
        }
    }
}

function sortTable(columnIndex) {
    const table = document.getElementById('documentTable');
    const rows = Array.from(table.rows).slice(1); // Exclude header row
    const isAscending = table.getAttribute('data-sort-order') === 'asc';
    const direction = isAscending ? 1 : -1;

    rows.sort((a, b) => {
        const aText = a.cells[columnIndex].textContent.trim();
        const bText = b.cells[columnIndex].textContent.trim();

        if (!isNaN(Date.parse(aText)) && !isNaN(Date.parse(bText))) {
            return direction * (new Date(aText) - new Date(bText));
        } else if (!isNaN(aText) && !isNaN(bText)) {
            return direction * (aText - bText);
        } else {
            return direction * aText.localeCompare(bText);
        }
    });

    rows.forEach(row => table.tBodies[0].appendChild(row));
    table.setAttribute('data-sort-order', isAscending ? 'desc' : 'asc');
}

// ...existing code...
function updateDocument() {
    const trackingNo = document.getElementById('sendToTrackingNo').textContent.trim();
    const fileInput = document.getElementById('updateDocumentFile');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select a file to update the document.');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('tracking_no', trackingNo);

    // Show notification
    alert('The document is being updated, please wait...');

    fetch('/update_document_file', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Document was updated successfully');
            closeSendToModal();
        } else {
            alert('Failed to update document');
        }
    })
    .catch(error => console.error('Error:', error));
}
// ...existing code...
