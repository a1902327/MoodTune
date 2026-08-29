document.addEventListener('DOMContentLoaded', () => {
  const profileContent = document.getElementById('profile-card-content');
  const profileLoader = document.getElementById('profile-card-loader');
  const songsList = document.getElementById('saved-songs-list');
  const songsLoader = document.getElementById('songs-loader');
  const noSongsMessage = document.getElementById('no-songs-message');
  const editModal = document.getElementById('edit-profile-modal');
  const editProfileBtn = document.getElementById('edit-profile-btn');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  const editForm = document.getElementById('edit-profile-form');
  const avatarInput = document.getElementById('edit-avatar');
  const avatarPreview = document.getElementById('avatar-preview');

  let currentUserData = {};

  async function loadProfileData() {
    try {
      const response = await fetch('/profile');
      if (response.status === 401) return (window.location.href = '/users/login');
      const data = await response.json();
      currentUserData = data.user;
      displayProfileInfo(data.user);
      displaySavedSongs(data.savedSongs);
    } catch (err) {
      console.error('Load Error:', err);
      profileLoader.style.display = 'none';
    }
  }

  function displayProfileInfo(user) {
    document.getElementById('user-avatar').src = user.avatar || '/images/default-avatar.png';
    document.getElementById('user-name').textContent = user.name;
    document.getElementById('user-email').textContent = user.email;
    document.getElementById('user-dob').textContent = user.dateOfBirth;
    document.getElementById('user-address').textContent = user.address;
    profileLoader.style.display = 'none';
    profileContent.style.display = 'block';
  }

  function displaySavedSongs(songs) {
    songsLoader.style.display = 'none';
    songsList.innerHTML = '';
    if (!songs || songs.length === 0) return (noSongsMessage.style.display = 'block');
    noSongsMessage.style.display = 'none';
    songs.forEach(song => {
      const songItem = document.createElement('div');
      songItem.className = 'saved-song-item';
      songItem.dataset.trackId = song.spotify_track_id;
      songItem.innerHTML = `
        <img src="${song.artwork}" alt="Album art" class="saved-song-artwork">
        <div class="saved-song-info"><h3>${song.track_name}</h3><p>${song.artist}</p></div>
        <div class="saved-song-actions">
          <a href="${song.spotify_url}" target="_blank" class="action-btn spotify-link-btn"><i class="fab fa-spotify"></i></a>
          <button class="action-btn delete-btn"><i class="fas fa-trash-alt"></i></button>
        </div>`;
      songsList.appendChild(songItem);
    });
  }

  async function deleteSong(event) {
    const button = event.target.closest('.delete-btn');
    if (!button) return;
    const item = button.closest('.saved-song-item');
    const trackId = item.dataset.trackId;
    const res = await fetch(`/profile/saved-track/${trackId}`, { method: 'DELETE' });
    if (res.ok) item.remove();
  }

  function openEditModal() {
    document.getElementById('edit-name').value = currentUserData.name;
    document.getElementById('edit-dob').value = new Date(currentUserData.rawDateOfBirth).toISOString().split('T')[0];
    document.getElementById('edit-address').value = currentUserData.address;
    avatarPreview.src = currentUserData.avatar;
    editModal.style.display = 'flex';
  }

  function closeEditModal() {
    editModal.style.display = 'none';
  }

  async function handleProfileUpdate(event) {
    event.preventDefault();
    const formData = new FormData(editForm);

    try {
      const response = await fetch('/profile', {
        method: 'PUT',
        body: formData
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Update failed');

      currentUserData.name = formData.get('name');
      currentUserData.dateOfBirth = new Date(formData.get('date_of_birth')).toLocaleDateString();
      currentUserData.address = formData.get('address');

      document.getElementById('user-name').textContent = currentUserData.name;
      document.getElementById('user-dob').textContent = currentUserData.dateOfBirth;
      document.getElementById('user-address').textContent = currentUserData.address;

      closeEditModal();
    } catch (err) {
      console.error('Update Error:', err);
      alert(err.message);
    }
  }

  avatarInput.addEventListener('change', function () {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => (avatarPreview.src = e.target.result);
      reader.readAsDataURL(file);
    } else {
      avatarPreview.src = currentUserData.avatar;
    }
  });

  songsList.addEventListener('click', deleteSong);
  editProfileBtn.addEventListener('click', openEditModal);
  closeModalBtn.addEventListener('click', closeEditModal);
  cancelEditBtn.addEventListener('click', closeEditModal);
  editForm.addEventListener('submit', handleProfileUpdate);

  loadProfileData();
});
