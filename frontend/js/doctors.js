/**
 * CareTrack Clinic - Doctors Controller
 */

let allDoctors = [];

document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('doctors.html')) {
    initDoctors();
  }
});

async function initDoctors() {
  const role = window.getUserRole();
  const isAdmin = role === 'Administrator';

  // Toggle Admin options
  if (isAdmin) {
    const addBtn = document.getElementById('btn-open-doctor-modal');
    if (addBtn) addBtn.style.display = 'inline-flex';
    
    const actionsHeaders = document.querySelectorAll('.actions-column');
    actionsHeaders.forEach(el => el.style.display = 'table-cell');
  }

  // Setup event listeners
  setupEventListeners();

  // Load doctors
  await loadDoctors();
}

function setupEventListeners() {
  const modal = document.getElementById('doctor-modal');
  const openModalBtn = document.getElementById('btn-open-doctor-modal');
  const closeModalBtn = document.getElementById('btn-close-doctor-modal');
  const cancelFormBtn = document.getElementById('btn-cancel-doctor-form');
  const form = document.getElementById('doctor-form');
  const searchInput = document.getElementById('search-doctors');

  if (openModalBtn) {
    openModalBtn.addEventListener('click', () => {
      document.getElementById('doctor-modal-title').textContent = 'Register Doctor';
      form.reset();
      document.getElementById('doctor-id').value = '';
      modal.classList.add('show');
    });
  }

  const hideModal = () => modal.classList.remove('show');

  if (closeModalBtn) closeModalBtn.addEventListener('click', hideModal);
  if (cancelFormBtn) cancelFormBtn.addEventListener('click', hideModal);

  // Submit doctor registration/updates
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const id = document.getElementById('doctor-id').value;
      const payload = {
        full_name: document.getElementById('doc-name').value.trim(),
        specialty: document.getElementById('doc-specialty').value.trim(),
        department: document.getElementById('doc-department').value.trim(),
        contact_info: document.getElementById('doc-contact').value.trim()
      };

      try {
        let response;
        if (id) {
          response = await API.put(`/doctors/${id}`, payload);
        } else {
          response = await API.post('/doctors', payload);
        }

        if (response && response.success) {
          API.showToast(id ? 'Doctor details updated successfully' : 'Doctor registered successfully', 'success');
          hideModal();
          await loadDoctors();
        }
      } catch (error) {
        console.error('Failed to save doctor:', error);
      }
    });
  }

  // Search logic
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const filtered = allDoctors.filter(doc => 
        doc.full_name.toLowerCase().includes(query) || 
        doc.specialty.toLowerCase().includes(query) || 
        doc.department.toLowerCase().includes(query)
      );
      renderDoctors(filtered);
    });
  }
}

async function loadDoctors() {
  try {
    const response = await API.get('/doctors');
    if (response && response.success) {
      allDoctors = response.data;
      renderDoctors(allDoctors);
    }
  } catch (error) {
    console.error('Failed to load doctors:', error);
  }
}

function renderDoctors(doctorsList) {
  const tbody = document.getElementById('doctors-table-body');
  if (!tbody) return;

  const role = window.getUserRole();
  const isAdmin = role === 'Administrator';

  if (doctorsList.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="${isAdmin ? 5 : 4}" style="text-align: center; color: var(--text-secondary); padding: 30px;">
          No shifokor records found.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = '';
  doctorsList.forEach(doc => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-weight: 600; color: #fff;">${doc.full_name}</td>
      <td><span class="badge" style="background: rgba(59, 130, 246, 0.1); color: #60a5fa;">${doc.specialty}</span></td>
      <td>${doc.department}</td>
      <td>${doc.contact_info}</td>
      ${isAdmin ? `
        <td style="text-align: right;" class="actions-column">
          <button class="btn-mrms btn-secondary" onclick="editDoctor('${doc.id}')" style="padding: 6px 10px; font-size: 0.8rem; margin-right: 5px;">
            <i class="fa-solid fa-pen"></i> Edit
          </button>
          <button class="btn-mrms btn-danger" onclick="deleteDoctor('${doc.id}')" style="padding: 6px 10px; font-size: 0.8rem;">
            <i class="fa-solid fa-trash"></i> Delete
          </button>
        </td>
      ` : ''}
    `;
    tbody.appendChild(tr);
  });
}

// Global hooks for dynamic elements
window.editDoctor = async function(id) {
  try {
    const response = await API.get(`/doctors/${id}`);
    if (response && response.success) {
      const doc = response.data;
      
      document.getElementById('doctor-id').value = doc.id;
      document.getElementById('doc-name').value = doc.full_name;
      document.getElementById('doc-specialty').value = doc.specialty;
      document.getElementById('doc-department').value = doc.department;
      document.getElementById('doc-contact').value = doc.contact_info;

      document.getElementById('doctor-modal-title').textContent = 'Modify Doctor Profile';
      document.getElementById('doctor-modal').classList.add('show');
    }
  } catch (error) {
    console.error('Error fetching doctor details:', error);
  }
};

window.deleteDoctor = async function(id) {
  if (confirm('Are you absolutely sure you want to delete this doctor? All patient assignments must be reassigned first.')) {
    try {
      const response = await API.delete(`/doctors/${id}`);
      if (response && response.success) {
        API.showToast('Doctor deleted successfully', 'success');
        await loadDoctors();
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  }
};
