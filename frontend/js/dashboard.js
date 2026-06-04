/**
 * CareTrack Clinic - Dashboard Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  // Only execute if on dashboard.html
  if (window.location.pathname.includes('dashboard.html')) {
    initDashboard();
  }
});

async function initDashboard() {
  // Set current date
  const dateEl = document.getElementById('current-date');
  if (dateEl) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateEl.textContent = new Date().toLocaleDateString('en-US', options);
  }

  try {
    await Promise.all([
      fetchStats(),
      fetchRecentActivities()
    ]);
  } catch (error) {
    console.error('Failed to initialize dashboard:', error);
  }
}

async function fetchStats() {
  try {
    const response = await API.get('/dashboard/stats');
    if (response && response.success) {
      const stats = response.data;
      
      document.getElementById('stat-doctors-count').textContent = stats.totalDoctors;
      document.getElementById('stat-patients-count').textContent = stats.totalPatients;
      
      const diagCount = document.getElementById('stat-diagnoses-count');
      if (diagCount) diagCount.textContent = stats.totalDiagnoses;
      
      const userCount = document.getElementById('stat-users-count');
      if (userCount) userCount.textContent = stats.totalUsers;
    }
  } catch (error) {
    console.error('Error fetching stats:', error);
  }
}

async function fetchRecentActivities() {
  const container = document.getElementById('activity-feed-container');
  if (!container) return;

  try {
    const response = await API.get('/dashboard/recent');
    if (response && response.success) {
      const activities = response.data;

      if (activities.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">No recent clinical activities recorded.</p>';
        return;
      }

      container.innerHTML = '';
      activities.forEach(act => {
        let bulletIcon = '';
        let bulletClass = '';

        if (act.type === 'doctor') {
          bulletIcon = '<i class="fa-solid fa-user-doctor"></i>';
          bulletClass = 'bullet-doctor';
        } else if (act.type === 'patient') {
          bulletIcon = '<i class="fa-solid fa-hospital-user"></i>';
          bulletClass = 'bullet-patient';
        } else if (act.type === 'diagnosis') {
          bulletIcon = '<i class="fa-solid fa-file-medical"></i>';
          bulletClass = 'bullet-diagnosis';
        }

        const formattedDate = formatTimeAgo(new Date(act.timestamp));

        const item = document.createElement('div');
        item.className = 'activity-item';
        item.innerHTML = `
          <div class="activity-bullet ${bulletClass}">
            ${bulletIcon}
          </div>
          <div class="activity-content">
            <div class="activity-header">
              <span class="activity-action">${act.action}</span>
              <span class="activity-time">${formattedDate}</span>
            </div>
            <div class="activity-title">${act.title}</div>
            <div class="activity-subtitle">${act.subtitle}</div>
          </div>
        `;
        container.appendChild(item);
      });
    }
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    container.innerHTML = '<p style="color: var(--color-danger); text-align: center; padding: 20px;">Failed to load activity log.</p>';
  }
}

// Format relative date helper
function formatTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return interval + " year" + (interval > 1 ? "s" : "") + " ago";
  
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return interval + " month" + (interval > 1 ? "s" : "") + " ago";
  
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return interval + " day" + (interval > 1 ? "s" : "") + " ago";
  
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return interval + " hour" + (interval > 1 ? "s" : "") + " ago";
  
  interval = Math.floor(seconds / 60);
  if (interval >= 1) return interval + " minute" + (interval > 1 ? "s" : "") + " ago";
  
  if (seconds < 10) return "Just now";
  return Math.floor(seconds) + " seconds ago";
}
