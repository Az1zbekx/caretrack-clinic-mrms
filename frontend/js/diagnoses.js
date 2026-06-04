/**
 * CareTrack Clinic - Diagnoses Controller
 */

let allDiagnoses = [];
let allPatients = [];

document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('diagnoses.html')) {
    initDiagnoses();
  }
});

async function initDiagnoses() {
  const role = window.getUserRole();
  
  // Guard clause for Receptionist
  if (role === 'Receptionist') {
    window.location.href = '/dashboard.html';
    return;
  }

  const isAdmin = role === 'Administrator';
  const isClinician = role === 'Clinician';

  // Toggle buttons based on role
  if (isAdmin || isClinician) {
    const addBtn = document.getElementById('btn-open-diagnosis-modal');
    if (addBtn) addBtn.style.display = 'inline-flex';

    const actionColumns = document.querySelectorAll('.actions-column');
    actionColumns.forEach(el => el.style.display = 'table-cell');
  }

  setupEventListeners();

  await Promise.all([
    loadPatients(),
    loadDiagnoses()
  ]);
}

function setupEventListeners() {
  const modal = document.getElementById('diagnosis-modal');
  const openModalBtn = document.getElementById('btn-open-diagnosis-modal');
  const closeModalBtn = document.getElementById('btn-close-diagnosis-modal');
  const cancelFormBtn = document.getElementById('btn-cancel-diagnosis-form');
  const form = document.getElementById('diagnosis-form');
  const searchInput = document.getElementById('search-diagnoses');

  if (openModalBtn) {
    openModalBtn.addEventListener('click', () => {
      document.getElementById('diagnosis-modal-title').textContent = 'Record Diagnosis';
      document.getElementById('patient-select-group').style.display = 'block'; // Show select input
      form.reset();
      document.getElementById('diagnosis-id').value = '';
      modal.classList.add('show');
    });
  }

  const hideModal = () => modal.classList.remove('show');
  if (closeModalBtn) closeModalBtn.addEventListener('click', hideModal);
  if (cancelFormBtn) cancelFormBtn.addEventListener('click', hideModal);

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const id = document.getElementById('diagnosis-id').value;
      const patientId = document.getElementById('diag-patient').value;
      
      const payload = {
        icd_code: document.getElementById('diag-icd').value.trim().toUpperCase(),
        severity: document.getElementById('diag-severity').value,
        description: document.getElementById('diag-desc').value.trim(),
        patient_id: patientId
      };

      try {
        let response;
        if (id) {
          // Put updates
          // Wait, the API routes for PUT diagnoses is PUT /api/diagnoses/:id
          response = await API.put(`/diagnoses/${id}`, payload);
        } else {
          // Post creation
          response = await API.post('/diagnoses', payload);
        }

        if (response && response.success) {
          API.showToast(id ? 'Diagnosis updated successfully' : 'Diagnosis logged successfully', 'success');
          hideModal();
          await loadDiagnoses();
        }
      } catch (error) {
        console.error('Failed to save diagnosis:', error);
      }
    });
  }

  // Search filter
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const filtered = allDiagnoses.filter(diag => 
        diag.icd_code.toLowerCase().includes(query) ||
        diag.description.toLowerCase().includes(query) ||
        (diag.patient && diag.patient.full_name.toLowerCase().includes(query))
      );
      renderDiagnoses(filtered);
    });
  }
}

async function loadPatients() {
  try {
    const response = await API.get('/patients');
    if (response && response.success) {
      allPatients = response.data;
      
      // Populate patient selection inside diagnosis modal
      const select = document.getElementById('diag-patient');
      if (select) {
        select.innerHTML = '<option value="" disabled selected>Choose a Patient</option>';
        allPatients.forEach(pat => {
          const opt = document.createElement('option');
          opt.value = pat.id;
          opt.textContent = `${pat.full_name} (${pat.age} y/o, ${pat.gender})`;
          select.appendChild(opt);
        });
      }
    }
  } catch (error) {
    console.error('Error fetching patients for list:', error);
  }
}

async function loadDiagnoses() {
  try {
    const response = await API.get('/diagnoses');
    if (response && response.success) {
      allDiagnoses = response.data;
      renderDiagnoses(allDiagnoses);
    }
  } catch (error) {
    console.error('Failed to load diagnoses:', error);
  }
}

function renderDiagnoses(diagnosesList) {
  const tbody = document.getElementById('diagnoses-table-body');
  if (!tbody) return;

  const role = window.getUserRole();
  const isAdmin = role === 'Administrator';
  const isClinician = role === 'Clinician';
  const isAllowed = isAdmin || isClinician;

  if (diagnosesList.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="${isAllowed ? 6 : 5}" style="text-align: center; color: var(--text-secondary); padding: 30px;">
          No diagnosis logs found in database.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = '';
  diagnosesList.forEach(diag => {
    const dateStr = new Date(diag.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    let badgeClass = `badge-${diag.severity.toLowerCase()}`;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span class="timeline-code" style="font-weight: 700;">${diag.icd_code}</span></td>
      <td style="font-weight: 600; color: #fff;">${diag.patient ? diag.patient.full_name : 'Unknown Patient'}</td>
      <td><span class="badge ${badgeClass}">${diag.severity}</span></td>
      <td>${diag.description}</td>
      <td>${dateStr}</td>
      ${isAllowed ? `
        <td style="text-align: right;" class="actions-column">
          <button class="btn-mrms btn-secondary" onclick="editDiagnosis('${diag.id}')" style="padding: 6px 10px; font-size: 0.8rem; margin-right: 5px;">
            <i class="fa-solid fa-pen"></i> Edit
          </button>
          ${isAdmin ? `
            <button class="btn-mrms btn-danger" onclick="deleteDiagnosis('${diag.id}')" style="padding: 6px 10px; font-size: 0.8rem;">
              <i class="fa-solid fa-trash"></i> Delete
            </button>
          ` : ''}
        </td>
      ` : ''}
    `;
    tbody.appendChild(tr);
  });
}

// Global hooks for dynamic actions
window.editDiagnosis = async function(id) {
  try {
    const response = await API.get(`/diagnoses/${id}`);
    if (response && response.success) {
      const diag = response.data;
      
      document.getElementById('diagnosis-id').value = diag.id;
      document.getElementById('diag-patient').value = diag.patient_id;
      // Hide patient select box since we're editing an existing diagnosis (avoid changing patient context)
      document.getElementById('patient-select-group').style.display = 'none';

      document.getElementById('diag-icd').value = diag.icd_code;
      document.getElementById('diag-severity').value = diag.severity;
      document.getElementById('diag-desc').value = diag.description;

      document.getElementById('diagnosis-modal-title').textContent = 'Modify Diagnosis Record';
      document.getElementById('diagnosis-modal').classList.add('show');
    }
  } catch (error) {
    console.error('Failed to fetch diagnosis details:', error);
  }
};

window.deleteDiagnosis = async function(id) {
  if (confirm('Are you sure you want to permanently delete this diagnosis log from the registry?')) {
    try {
      const response = await API.delete(`/diagnoses/${id}`);
      if (response && response.success) {
        API.showToast('Diagnosis log deleted successfully', 'success');
        await loadDiagnoses();
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  }
};
