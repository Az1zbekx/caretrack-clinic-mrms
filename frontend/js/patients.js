/**
 * CareTrack Clinic - Patients Controller
 */

let allPatients = [];
let allDoctors = [];
let selectedPatientId = null;

document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('patients.html')) {
    initPatients();
  }
});

async function initPatients() {
  const role = window.getUserRole();
  const isAdmin = role === 'Administrator';
  const isReceptionist = role === 'Receptionist';
  const isClinician = role === 'Clinician';

  // Toggle Admissions Access
  if (isAdmin || isReceptionist) {
    const admitBtn = document.getElementById('btn-open-patient-modal');
    if (admitBtn) admitBtn.style.display = 'inline-flex';
  }

  // Setup Event Listeners
  setupEventListeners();

  // Load baseline resources
  await Promise.all([
    loadDoctors(),
    loadPatients()
  ]);
}

function setupEventListeners() {
  const patientModal = document.getElementById('patient-modal');
  const openPatientModalBtn = document.getElementById('btn-open-patient-modal');
  const closePatientModalBtn = document.getElementById('btn-close-patient-modal');
  const cancelPatientFormBtn = document.getElementById('btn-cancel-patient-form');
  const patientForm = document.getElementById('patient-form');
  
  const profileModal = document.getElementById('profile-modal');
  const closeProfileModalBtn = document.getElementById('btn-close-profile-modal');
  
  const diagnosisModal = document.getElementById('diagnosis-modal');
  const closeDiagnosisModalBtn = document.getElementById('btn-close-diagnosis-modal');
  const cancelDiagnosisFormBtn = document.getElementById('btn-cancel-diagnosis-form');
  const diagnosisForm = document.getElementById('diagnosis-form');
  
  const searchInput = document.getElementById('search-patients');

  // Open Admissions modal
  if (openPatientModalBtn) {
    openPatientModalBtn.addEventListener('click', () => {
      document.getElementById('patient-modal-title').textContent = 'Admit Patient';
      patientForm.reset();
      document.getElementById('patient-id').value = '';
      patientModal.classList.add('show');
    });
  }

  const hidePatientModal = () => patientModal.classList.remove('show');
  if (closePatientModalBtn) closePatientModalBtn.addEventListener('click', hidePatientModal);
  if (cancelPatientFormBtn) cancelPatientFormBtn.addEventListener('click', hidePatientModal);

  // Submit patient admissions / updates
  if (patientForm) {
    patientForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const id = document.getElementById('patient-id').value;
      const payload = {
        full_name: document.getElementById('pat-name').value.trim(),
        age: parseInt(document.getElementById('pat-age').value, 10),
        gender: document.getElementById('pat-gender').value,
        phone: document.getElementById('pat-phone').value.trim(),
        address: document.getElementById('pat-address').value.trim(),
        doctor_id: document.getElementById('pat-doctor').value
      };

      try {
        let response;
        if (id) {
          response = await API.put(`/patients/${id}`, payload);
        } else {
          response = await API.post('/patients', payload);
        }

        if (response && response.success) {
          API.showToast(id ? 'Patient details modified successfully' : 'Patient admitted successfully', 'success');
          hidePatientModal();
          // If profile modal is open, refresh profile
          if (profileModal.classList.contains('show') && selectedPatientId === id) {
            await viewPatientProfile(id);
          }
          await loadPatients();
        }
      } catch (error) {
        console.error('Failed to submit patient details:', error);
      }
    });
  }

  // Profile modal operations
  const hideProfileModal = () => profileModal.classList.remove('show');
  if (closeProfileModalBtn) closeProfileModalBtn.addEventListener('click', hideProfileModal);

  // Diagnosis Modal operations
  const hideDiagnosisModal = () => diagnosisModal.classList.remove('show');
  if (closeDiagnosisModalBtn) closeDiagnosisModalBtn.addEventListener('click', hideDiagnosisModal);
  if (cancelDiagnosisFormBtn) cancelDiagnosisFormBtn.addEventListener('click', hideDiagnosisModal);

  // Submit diagnosis form
  if (diagnosisForm) {
    diagnosisForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const patientId = document.getElementById('diag-patient-id').value;
      const payload = {
        patient_id: patientId,
        icd_code: document.getElementById('diag-icd').value.trim().toUpperCase(),
        severity: document.getElementById('diag-severity').value,
        description: document.getElementById('diag-desc').value.trim()
      };

      try {
        const response = await API.post('/diagnoses', payload);
        if (response && response.success) {
          API.showToast('Clinical diagnosis logged successfully', 'success');
          hideDiagnosisModal();
          // Refresh profile details to show new diagnosis in timeline
          await viewPatientProfile(patientId);
        }
      } catch (error) {
        console.error('Failed to add diagnosis:', error);
      }
    });
  }

  // Search filter
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const filtered = allPatients.filter(pat => 
        pat.full_name.toLowerCase().includes(query) || 
        pat.phone.includes(query) || 
        (pat.doctor && pat.doctor.full_name.toLowerCase().includes(query))
      );
      renderPatients(filtered);
    });
  }
}

async function loadDoctors() {
  try {
    const response = await API.get('/doctors');
    if (response && response.success) {
      allDoctors = response.data;
      
      // Populate doctor selection inside patient admissions modal
      const select = document.getElementById('pat-doctor');
      if (select) {
        // Keep placeholder
        select.innerHTML = '<option value="" disabled selected>Assign a Doctor</option>';
        allDoctors.forEach(doc => {
          const opt = document.createElement('option');
          opt.value = doc.id;
          opt.textContent = `${doc.full_name} (${doc.specialty})`;
          select.appendChild(opt);
        });
      }
    }
  } catch (error) {
    console.error('Failed to load doctors list:', error);
  }
}

async function loadPatients() {
  try {
    const response = await API.get('/patients');
    if (response && response.success) {
      allPatients = response.data;
      renderPatients(allPatients);
    }
  } catch (error) {
    console.error('Failed to load patient records:', error);
  }
}

function renderPatients(patientsList) {
  const tbody = document.getElementById('patients-table-body');
  if (!tbody) return;

  if (patientsList.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: var(--text-secondary); padding: 30px;">
          No patient records match the search query.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = '';
  patientsList.forEach(pat => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-weight: 600; color: #fff;">${pat.full_name}</td>
      <td>${pat.age}</td>
      <td>${pat.gender}</td>
      <td>${pat.phone}</td>
      <td>
        <span style="color: var(--color-secondary); font-weight: 500;">
          ${pat.doctor ? pat.doctor.full_name : 'Unassigned'}
        </span>
      </td>
      <td style="text-align: right;">
        <button class="btn-mrms btn-primary" onclick="viewPatientProfile('${pat.id}')" style="padding: 6px 12px; font-size: 0.8rem;">
          <i class="fa-solid fa-folder-open"></i> View Profile
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Global functions for profile mapping
window.viewPatientProfile = async function(id) {
  selectedPatientId = id;
  try {
    const response = await API.get(`/patients/${id}`);
    if (response && response.success) {
      const patient = response.data;
      const role = window.getUserRole();

      // Set profile details
      document.getElementById('prof-avatar').textContent = patient.full_name.charAt(0).toUpperCase();
      document.getElementById('prof-name').textContent = patient.full_name;
      document.getElementById('prof-age-gender').textContent = `${patient.age} y/o, ${patient.gender}`;
      document.getElementById('prof-phone').textContent = patient.phone;
      document.getElementById('prof-address').textContent = patient.address;
      document.getElementById('prof-doctor').textContent = patient.doctor ? `${patient.doctor.full_name} (${patient.doctor.specialty})` : 'Unassigned';

      // RBAC UI tweaks for Profile Action Buttons
      const editBtn = document.getElementById('prof-btn-edit');
      const deleteBtn = document.getElementById('prof-btn-delete');
      const addDiagBtn = document.getElementById('prof-btn-add-diagnosis');

      if (editBtn) editBtn.style.display = (role === 'Administrator' || role === 'Clinician') ? 'block' : 'none';
      if (deleteBtn) deleteBtn.style.display = (role === 'Administrator') ? 'block' : 'none';
      if (addDiagBtn) addDiagBtn.style.display = (role === 'Administrator' || role === 'Clinician') ? 'inline-flex' : 'none';

      // Set click parameters
      if (editBtn) editBtn.onclick = () => launchEditPatient(patient);
      if (deleteBtn) deleteBtn.onclick = () => deletePatientProfile(patient.id);
      if (addDiagBtn) addDiagBtn.onclick = () => launchAddDiagnosis(patient);

      // Render timeline of diagnoses
      const timeline = document.getElementById('prof-diagnoses-timeline');
      if (timeline) {
        if (!patient.diagnoses || patient.diagnoses.length === 0) {
          timeline.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">No medical diagnoses logged yet.</p>';
        } else {
          timeline.innerHTML = '';
          patient.diagnoses.forEach(diag => {
            const dateStr = new Date(diag.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            let nodeClass = `node-${diag.severity.toLowerCase()}`;
            let badgeClass = `badge-${diag.severity.toLowerCase()}`;

            const node = document.createElement('div');
            node.className = `timeline-node ${nodeClass}`;
            node.innerHTML = `
              <div class="timeline-card">
                <div class="timeline-header">
                  <span class="timeline-code">${diag.icd_code}</span>
                  <span class="badge ${badgeClass}">${diag.severity}</span>
                </div>
                <div style="font-size: 0.95rem; color: #fff; font-weight: 500;">${diag.description}</div>
                <div class="timeline-date">${dateStr}</div>
              </div>
            `;
            timeline.appendChild(node);
          });
        }
      }

      // Show profile modal
      document.getElementById('profile-modal').classList.add('show');
    }
  } catch (error) {
    console.error('Error fetching patient profile:', error);
  }
};

function launchEditPatient(patient) {
  // Populate details
  document.getElementById('patient-id').value = patient.id;
  document.getElementById('pat-name').value = patient.full_name;
  document.getElementById('pat-age').value = patient.age;
  document.getElementById('pat-gender').value = patient.gender;
  document.getElementById('pat-phone').value = patient.phone;
  document.getElementById('pat-address').value = patient.address;
  document.getElementById('pat-doctor').value = patient.doctor_id;

  document.getElementById('patient-modal-title').textContent = 'Modify Patient Profile';
  
  // Display Admissions modal
  document.getElementById('patient-modal').classList.add('show');
}

function launchAddDiagnosis(patient) {
  // Pre-fill patient details
  document.getElementById('diag-patient-id').value = patient.id;
  document.getElementById('diag-patient-name').value = patient.full_name;
  
  // Reset other inputs
  document.getElementById('diag-icd').value = '';
  document.getElementById('diag-severity').value = '';
  document.getElementById('diag-desc').value = '';

  document.getElementById('diagnosis-modal').classList.add('show');
}

async function deletePatientProfile(id) {
  if (confirm('Are you completely sure you want to delete this patient profile? Doing so will permanently wipe out all clinical diagnosis history associated with them.')) {
    try {
      const response = await API.delete(`/patients/${id}`);
      if (response && response.success) {
        API.showToast('Patient record deleted successfully', 'success');
        document.getElementById('profile-modal').classList.remove('show');
        await loadPatients();
      }
    } catch (error) {
      console.error('Patient delete failed:', error);
    }
  }
}
