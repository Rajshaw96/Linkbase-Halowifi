const API_URL = 'https://us-central1-linkbase-halowifi.cloudfunctions.net/api/guestConnect';
const tableBody = document.querySelector('#guestTable');
const searchInput = document.querySelector('#searchInput');
const totalCountElement = document.querySelector('#totalCount');
const pageInfo = document.querySelector('#pageInfo');
const prevPage = document.querySelector('#prevPage');
const nextPage = document.querySelector('#nextPage');
const exportDropdown = document.querySelector('#exportDropdown');

let data = [];
let currentPage = 1;
let rowsPerPage = 8;
let sortField = '';
let sortOrder = 'asc';

async function fetchData() {
    const response = await fetch(API_URL);
    const json = await response.json();
    data = json.data;
    renderTable();
    updatePagination();
    totalCountElement.textContent = `Total Records: ${data.length}`;
}

function renderTable() {
    let filteredData = filterAndSortData(data);
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedData = filteredData.slice(start, end);

    tableBody.innerHTML = paginatedData
    .map(
        (item, index) => `
<tr>
    <td>${item.guestFullName}</td>
    <td>${item.guestPhoneNo}</td>
    <td>${item.guestEmailId}</td>
    <td>${item.propertyLocationId || 'N/A'}</td>
    <td>${new Date(item.createdAt).toLocaleDateString()}</td>
    <td>
        <button onclick="editRecord(${index})">&#9998;</button>
        <button onclick="deleteRecord(${index})">&#128465;</button>
    </td>
</tr>`
)
.join('');
}

function filterAndSortData(data) {
    let filtered = data.filter(
        (item) =>
            item.guestFullName.toLowerCase().includes(searchInput.value.toLowerCase()) ||
            item.guestEmailId.toLowerCase().includes(searchInput.value.toLowerCase()) ||
            (item.propertyLocationId || '').toLowerCase().includes(searchInput.value.toLowerCase())
    );

    if (sortField) {
        filtered.sort((a, b) => {
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

    return filtered;
}

function editRecord(index) {
    const record = data[index];
    const newName = prompt('Edit Name:', record.guestFullName);
    const newPhone = prompt('Edit Phone:', record.guestPhoneNo);
    const newEmail = prompt('Edit Email:', record.guestEmailId);
    if (newName && newPhone && newEmail) {
        data[index].guestFullName = newName;
        data[index].guestPhoneNo = newPhone;
        data[index].guestEmailId = newEmail;
        renderTable();
    }
}

function deleteRecord(index) {
    if (confirm('Are you sure you want to delete this record?')) {
        data.splice(index, 1);
        renderTable();
        updatePagination();
    }
}

function updatePagination() {
    const totalPages = Math.ceil(filterAndSortData(data).length / rowsPerPage);
    prevPage.disabled = currentPage === 1;
    nextPage.disabled = currentPage === totalPages;
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
}

function exportData(type) {
    const filteredData = filterAndSortData(data);
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

exportDropdown.addEventListener('change', () => {
    const exportType = exportDropdown.value;
    exportData(exportType);
    exportDropdown.value = '';
});

searchInput.addEventListener('input', () => {
    currentPage = 1;
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
    const totalPages = Math.ceil(filterAndSortData(data).length / rowsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderTable();
        updatePagination();
    }
});

fetchData();