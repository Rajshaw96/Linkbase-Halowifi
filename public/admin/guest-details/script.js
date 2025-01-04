const API_URL = 'https://us-central1-linkbase-halowifi.cloudfunctions.net/api/guestConnect';
const tableBody = document.querySelector('#guestTable');
const searchInput = document.querySelector('#searchInput');
const totalCountElement = document.querySelector('#totalCount');
const pageInfo = document.querySelector('#pageInfo');
const prevPage = document.querySelector('#prevPage');
const nextPage = document.querySelector('#nextPage');
const exportDropdown = document.querySelector('#exportDropdown');

let data = [];
let filteredData = [];
let currentPage = 1;
let rowsPerPage = 8;
let sortField = '';
let sortOrder = 'asc';

// Fetch data from the API
async function fetchData() {
    try {
        const response = await fetch(API_URL);
        const json = await response.json();
        data = json.data || [];
        filteredData = [...data]; // Initialize filteredData with all records
        renderTable();
        updatePagination();
        totalCountElement.textContent = `Total Records: ${data.length}`;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Render table with paginated and filtered data
function renderTable() {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedData = filteredData.slice(start, end);

    tableBody.innerHTML = paginatedData
        .map(
            (item) => `
<tr>
    <td>${item.guestFullName}</td>
    <td>${item.guestPhoneNo}</td>
    <td>${item.guestEmailId}</td>
    <td>${item.propertyLocationId || 'N/A'}</td>
    <td>${new Date(item.createdAt).toLocaleDateString()}</td>
    <td>
        <button onclick="editRecord('${item._id}')">&#9998;</button>
        <button onclick="deleteRecord('${item._id}')">&#128465;</button>
    </td>
</tr>`
        )
        .join('');
}

// Filter and sort data based on search and sorting criteria
function filterAndSortData() {
    filteredData = data.filter(
        (item) =>
            item.guestFullName.toLowerCase().includes(searchInput.value.toLowerCase()) ||
            item.guestEmailId.toLowerCase().includes(searchInput.value.toLowerCase()) ||
            (item.propertyLocationId || '').toLowerCase().includes(searchInput.value.toLowerCase())
    );

    if (sortField) {
        filteredData.sort((a, b) => {
            let valA = a[sortField];
            let valB = b[sortField];

            if (sortField === 'createdAt') {
                valA = new Date(valA);
                valB = new Date(valB);
            }

            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }
}

// Edit record
function editRecord(id) {
    const record = data.find((item) => item._id === id);
    if (!record) return;

    const newName = prompt('Edit Name:', record.guestFullName);
    const newPhone = prompt('Edit Phone:', record.guestPhoneNo);
    const newEmail = prompt('Edit Email:', record.guestEmailId);

    if (newName && newPhone && newEmail) {
        record.guestFullName = newName;
        record.guestPhoneNo = newPhone;
        record.guestEmailId = newEmail;
        filterAndSortData();
        renderTable();
    }
}

// Delete record
function deleteRecord(id) {
    if (confirm('Are you sure you want to delete this record?')) {
        data = data.filter((item) => item._id !== id);
        filterAndSortData();
        renderTable();
        updatePagination();
        totalCountElement.textContent = `Total Records: ${data.length}`;
    }
}

// Update pagination
function updatePagination() {
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    prevPage.disabled = currentPage === 1;
    nextPage.disabled = currentPage === totalPages;
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
}

// Export data
function exportData(type) {
    const exportData = filteredData.map((item) => ({
        Name: item.guestFullName,
        Phone: item.guestPhoneNo,
        Email: item.guestEmailId,
        Location: item.propertyLocationId || 'N/A',
        CreatedAt: new Date(item.createdAt).toLocaleDateString(),
    }));

    if (type === 'excel' || type === 'csv') {
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
        XLSX.writeFile(workbook, `export.${type === 'excel' ? 'xlsx' : 'csv'}`);
    } else if (type === 'pdf') {
        alert('PDF export is currently not implemented.');
    }
}

// Event listeners
searchInput.addEventListener('input', () => {
    currentPage = 1;
    filterAndSortData();
    renderTable();
    updatePagination();
});

prevPage.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        renderTable();
        updatePagination();
    }
});

nextPage.addEventListener('click', () => {
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderTable();
        updatePagination();
    }
});

exportDropdown.addEventListener('change', () => {
    const exportType = exportDropdown.value;
    exportData(exportType);
    exportDropdown.value = '';
});

// Initialize
fetchData();