document.addEventListener('DOMContentLoaded', function() {
    const scene = document.querySelector('a-scene');
    const video = document.querySelector('#video360');
    const loadingScreen = document.querySelector('#loadingScreen');
    const playControls = document.querySelector('#playControls');
    const playButton = document.querySelector('.play-btn');
    
    // Google Drive File ID Anda
    const fileId = '1QJj8ZcMjxcD8MZwbPWi4kWYnZwb57V-a';
    
    // Multiple fallback URLs untuk Google Drive
    const driveUrls = [
        `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`,
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=AIzaSyBFoII-8dR22e6k6B_VkL-07U2u-j8q6E0`,
        `https://docs.google.com/uc?export=download&id=${fileId}`
    ];
    
    let currentUrlIndex = 0;
    
    // Fungsi untuk mencoba load video dari URL yang berbeda
    function tryLoadVideo(urlIndex) {
        if (urlIndex >= driveUrls.length) {
            showError('Tidak dapat memuat video. Coba refresh halaman.');
            return;
        }
        
        const videoUrl = driveUrls[urlIndex];
        console.log('Mencoba load video dari:', videoUrl);
        
        video.src = videoUrl;
        video.load();
        
        // Set timeout untuk ganti URL jika loading terlalu lama
        const loadTimeout = setTimeout(() => {
            console.log('Timeout, mencoba URL berikutnya...');
            currentUrlIndex++;
            tryLoadVideo(currentUrlIndex);
        }, 10000);
        
        video.addEventListener('loadeddata', function() {
            clearTimeout(loadTimeout);
            console.log('Video berhasil dimuat!');
            loadingScreen.setAttribute('visible', 'false');
            playControls.setAttribute('visible', 'true');
        });
        
        video.addEventListener('error', function(e) {
            clearTimeout(loadTimeout);
            console.error('Error loading video dari URL:', videoUrl, e);
            currentUrlIndex++;
            tryLoadVideo(currentUrlIndex);
        });
        
        video.addEventListener('canplay', function() {
            console.log('Video siap diputar');
            loadingScreen.setAttribute('visible', 'false');
        });
        
        video.addEventListener('waiting', function() {
            console.log('Video buffering...');
            loadingScreen.setAttribute('visible', 'true');
        });
        
        video.addEventListener('playing', function() {
            console.log('Video mulai diputar');
            loadingScreen.setAttribute('visible', 'false');
        });
    }
    
    function showError(message) {
        loadingScreen.setAttribute('visible', 'true');
        loadingScreen.innerHTML = `
            <a-plane color="#000000" width="4" height="2" position="0 0 -2"></a-plane>
            <a-text value="${message}" 
                   align="center" 
                   position="0 0 -1.5" 
                   color="#FF4444"
                   scale="1.2 1.2 1.2"></a-text>
            <a-circle class="clickable" 
                     color="#4CAF50" 
                     radius="0.4" 
                     position="0 -0.5 -1.5"
                     onclick="window.location.reload()">
                <a-text value="Coba Lagi" align="center" position="0 0 0.02" color="#FFFFFF"></a-text>
            </a-circle>
        `;
    }
    
    // Event untuk tombol play
    playButton.addEventListener('click', function() {
        console.log('Memulai video...');
        
        // Sembunyikan controls
        playControls.setAttribute('visible', 'false');
        
        // Coba play video
        const playPromise = video.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log('Video berhasil diputar');
            }).catch(error => {
                console.error('Error playing video:', error);
                // Tampilkan instruksi interaksi
                showError('Klik layar untuk memutar video');
                playControls.setAttribute('visible', 'true');
            });
        }
    });
    
    // Handle interaksi user untuk autoplay
    document.addEventListener('click', function() {
        if (video.paused) {
            video.play().catch(e => console.log('Autoplay blocked:', e));
        }
    });
    
    // Handle VR mode
    scene.addEventListener('enter-vr', function() {
        console.log('Masuk VR mode');
        if (video.paused) {
            video.play().catch(e => console.log('VR autoplay blocked:', e));
        }
    });
    
    // Start loading video
    console.log('Memulai load video 2GB...');
    tryLoadVideo(currentUrlIndex);
    
    // Progress loading
    video.addEventListener('progress', function() {
        if (video.buffered.length > 0) {
            const bufferedEnd = video.buffered.end(video.buffered.length - 1);
            const duration = video.duration;
            if (duration > 0) {
                const percent = (bufferedEnd / duration) * 100;
                console.log(`Buffered: ${percent.toFixed(1)}%`);
            }
        }
    });
	// Tambahkan di script.js untuk handle video besar
video.addEventListener('loadstart', function() {
    console.log('Mulai loading video 2GB...');
});

video.addEventListener('canplaythrough', function() {
    console.log('Video cukup buffered untuk diputar tanpa interruption');
});

// Adaptive bitrate simulation
function checkBuffering() {
    if (video.buffered.length > 0) {
        const currentTime = video.currentTime;
        const bufferedEnd = video.buffered.end(0);
        const bufferAhead = bufferedEnd - currentTime;
        
        if (bufferAhead < 5) { // Jika buffer kurang dari 5 detik
            console.log('Video buffering, pause sementara...');
            video.playbackRate = 0.5; // Slow down jika perlu
        }
    }
}

setInterval(checkBuffering, 1000);
});