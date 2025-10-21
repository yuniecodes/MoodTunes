import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Music, LogOut, Smile, Frown, Meh, Heart, Cloud, Flame } from 'lucide-react';

const SPOTIFY_CLIENT_ID = "cadcdebb966f4d3a844d6613579033f6";
const REDIRECT_URI = "https://mood-tunes-three.vercel.app/callback";

const moodQueries = {
  chill: { icon: Cloud, color: "from-purple-400 to-teal-400" },
  happy: { icon: Smile, color: "from-yellow-400 to-orange-500" },
  sad: { icon: Frown, color: "from-blue-600 to-blue-900" },
  insecure: { icon: Meh, color: "from-teal-400 to-gray-600" },
  burnout: { icon: Cloud, color: "from-gray-700 to-yellow-800" },
  angst: { icon: Flame, color: "from-black to-gray-600" }
};

const moodTracks = {
  chill: ["7jXwaYTaruWQVmJgjAyVGj","1mJ9oAPuo3hHspOYamtoYc","7eKgcdYbbjQWjphO6IlZ7k","23MBi1j2kZJw3pTeTM2F3J","1iAm2oejGN7IOsaUkq2tgy","2Dgn3acAIPy3irYt7FHEkA","0sujgb2YTnMPzz9y4wNdWH","7KerpptlTiH5Yi3yt1iIsJ","783WjblRwRmcwQ9io7mBZv"],
  happy: ["455AfCsOhhLPRc68sE01D8","10Igtw8bSDyyFs7KIsKngZ","35mvY5S1H3J2QZyna3TFe0","1hG4V53eR16jg7jVTNLOiX","5HQVUIKwCEXpe7JIHyY734","5nujrmhLynf4yMoMtj8AQF","3ZFTkvIE7kyPt6Nu3PEa7V","7ju97lgwC2rKQ6wwsf9no9","6kex4EBAj0WHXDKZMEJaaF"],
  sad: ["3gdPwk2wyOXNRnTA1KXnEr","5rbuv6zso7QSaKt265H3M3","2gMXnyrvIjhVBUZwvLZDMP","4kkWvBCT6wq5NHoJjYRaPU","0SuQMjb2TleiKg1ebQSDnX","4cBm8rv2B5BJWU2pDaHVbF","7qEHsqek33rTcFNT9PFqLf","2uOEendbLHR18khIbwooJ1","5JCoSi02qi3jJeHdZXMmR8"],
  insecure: ["4xqrdfXkTW4T0RauPLv3WA","5CZ40GBx1sQ9agT82CLQCT","69HzZ3ti9DLwb0GdWCGYSo","0kn2gu8Pd03DiYHzRvX2Xk","6KfoDhO4XUWSbnyKjNp9c4","3vkCueOmm7xQDoJ17W1Pm3","2IVsRhKrx8hlQBOWy4qebo","5UXJzLFdBn6u9FJTCnoHrH","7wTqEW5nrMhvyEhEyTnOMd"],
  burnout: ["1KQc37jezhunxnOPhvdwSG","5OKyAO31eOeJV5qEx2lv4k","2bu6TFn64ASDFXocD9HQ38","7vu0JkJh0ldukEYbTVcqd0","7loxeufSLQPImESzV0Cn30","75pQd26khpV9EMVBRIeDm6","2n0U2OG5d6TuW5mKx7YrC0","2z1xTVeAvEIdniWEnoGeAH","5o5akY9xnEk6lpMkD8RwD9"],
  angst: ["2ADSh3Mp744n2586tpUtIW","0NJAqnvbF6vzripOB7PclP","2tzAN1L07SNwnOdgOEeuQr","1nzcXFlq2lJULOJxCg5vBA","57Z7lSnhwx82laEb6rdZPB","2ESL2ZcFU32llFIyXLFy5P","7C9Knp9FzLY6RwgktmW9Ge","7C9Knp9FzLY6RwgktmW9Ge","01iNOMVE89uKaurFTDZX2Y"]
};

export default function MoodTunes() {
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);
  const [spotifyToken, setSpotifyToken] = useState(null);
  const [selectedMood, setSelectedMood] = useState('');
  const [tracks, setTracks] = useState([]);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [playingTrackId, setPlayingTrackId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [users, setUsers] = useState([{ email: 'm@gmail.com', password: '12345', name: 'Demo User' }]);

  useEffect(() => {
    const savedUser = sessionStorage.getItem('moodtunes_user');
    const savedToken = sessionStorage.getItem('spotify_token');
    if (savedUser) { setUser(JSON.parse(savedUser)); setCurrentPage('app'); }
    if (savedToken) setSpotifyToken(savedToken);
  }, []);

  useEffect(() => {
    if (user) { sessionStorage.setItem('moodtunes_user', JSON.stringify(user)); }
    else { sessionStorage.removeItem('moodtunes_user'); }
  }, [user]);

  const handleSignup = (e) => {
    e.preventDefault();
    if (!name || !email || !password) return alert('❌ Please fill in all fields.');
    if (users.find(u => u.email === email)) return alert('❌ Email already exists.');
    setUsers([...users, { name, email, password }]);
    alert('✅ Signup successful! Please login.');
    setCurrentPage('login');
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const foundUser = users.find(u => u.email === email && u.password === password);
    if (foundUser) { setUser(foundUser); setCurrentPage('app'); }
    else { alert('❌ Invalid credentials. Try: m@gmail.com / 12345'); }
  };

  const handleLogout = () => {
    setUser(null);
    setSpotifyToken(null);
    sessionStorage.clear();
    setCurrentPage('login');
    if (currentAudio) currentAudio.pause();
  };

  const connectToSpotify = () => {
    const scopes = 'user-read-private user-read-email';
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${SPOTIFY_CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(scopes)}`;
    window.location.href = authUrl;
  };

  const fetchPlaylist = async (mood) => {
    if (!spotifyToken) return alert('Please connect to Spotify first!');
    setSelectedMood(mood);
    setLoading(true);
    try {
      const ids = moodTracks[mood].join(',');
      const response = await axios.get(`https://api.spotify.com/v1/tracks?ids=${ids}`, {
        headers: { 'Authorization': `Bearer ${spotifyToken}` }
      });
      setTracks(response.data.tracks);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch tracks.');
    } finally { setLoading(false); }
  };

  const playPreview = (url, trackId) => {
    if (currentAudio) { currentAudio.pause(); setCurrentAudio(null); setPlayingTrackId(null); }
    if (playingTrackId === trackId) return;
    const audio = new Audio(url);
    audio.play();
    setCurrentAudio(audio);
    setPlayingTrackId(trackId);
    audio.addEventListener('ended', () => { setCurrentAudio(null); setPlayingTrackId(null); });
  };

  const MoodIcon = selectedMood ? moodQueries[selectedMood].icon : Music;
  const moodGradient = selectedMood ? moodQueries[selectedMood].color : "from-purple-600 to-blue-600";

  // LOGIN PAGE
  if (currentPage === 'login') return (
    <div className={`min-h-screen bg-gradient-to-br ${moodGradient} flex flex-col justify-center items-center px-4 py-safe transition-all duration-1000`}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
        <div className="text-center mb-6">
          <Music size={48} className="mx-auto mb-3 text-purple-600" />
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">MoodTunes</h1>
          <p className="text-sm text-gray-500 mt-2">Your soundtrack for every mood</p>
        </div>
        <input type="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-purple-500 outline-none" />
        <input type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-purple-500 outline-none" />
        <button onClick={handleLogin} className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition">Login</button>
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>Demo: <strong>m@gmail.com</strong> / <strong>12345</strong></p>
          <p className="mt-2">Don’t have an account? <button onClick={()=>setCurrentPage('signup')} className="text-purple-600 font-semibold hover:underline">Sign Up</button></p>
        </div>
      </div>
    </div>
  );

  // SIGNUP PAGE
  if (currentPage === 'signup') return (
    <div className={`min-h-screen bg-gradient-to-br ${moodGradient} flex flex-col justify-center items-center px-4 py-safe`}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
        <div className="text-center mb-6">
          <Music size={48} className="mx-auto mb-3 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-800">Create Account</h1>
        </div>
        <input type="text" placeholder="Full Name" value={name} onChange={(e)=>setName(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-purple-500 outline-none" />
        <input type="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-purple-500 outline-none" />
        <input type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-purple-500 outline-none" />
        <button onClick={handleSignup} className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition">Sign Up</button>
        <p className="text-center text-sm text-gray-600 mt-4">Already have an account? <button onClick={()=>setCurrentPage('login')} className="text-purple-600 font-semibold hover:underline">Login</button></p>
      </div>
    </div>
  );

  // MAIN APP PAGE
  return (
    <div className={`min-h-screen bg-gradient-to-br ${moodGradient} p-4 sm:p-6`}>
      <div className="max-w-5xl mx-auto">
        <div className="bg-white bg-opacity-95 rounded-2xl shadow-xl p-4 sm:p-6 mb-4 sm:mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <MoodIcon size={36} className="text-purple-600" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">MoodTunes</h1>
              <p className="text-sm text-gray-600">Welcome, {user?.name}!</p>
            </div>
          </div>
          <div className="flex gap-2 flex-col sm:flex-row w-full sm:w-auto">
            {!spotifyToken && <button onClick={connectToSpotify} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-semibold transition">Connect to Spotify</button>}
            <button onClick={handleLogout} className="flex items-center justify-center gap-2 px-4 py-2 w-full sm:w-auto bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>

        <div className="bg-white bg-opacity-95 rounded-2xl shadow-xl p-4 sm:p-6 mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 text-center sm:text-left">How are you feeling?</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {Object.entries(moodQueries).map(([mood, { icon: Icon }]) => (
              <button key={mood} onClick={() => fetchPlaylist(mood)} disabled={!spotifyToken} className={`p-3 sm:p-4 rounded-xl border-2 transition-all text-center ${selectedMood===mood?'border-purple-600 bg-purple-50':'border-gray-200 hover:border-purple-400'} ${!spotifyToken?'opacity-50 cursor-not-allowed':'cursor-pointer'}`}>
                <Icon size={28} className="mx-auto mb-1 sm:mb-2" />
                <p className="font-semibold text-sm sm:text-base capitalize">{mood}</p>
              </button>
            ))}
          </div>
        </div>

        {loading && <div className="bg-white bg-opacity-95 rounded-2xl shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading your playlist...</p>
        </div>}

        {!loading && tracks.length>0 && (
          <div className="bg-white bg-opacity-95 rounded-2xl shadow-xl p-4 sm:p-6 overflow-y-auto max-h-[70vh]">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">🎧 {selectedMood.charAt(0).toUpperCase() + selectedMood.slice(1)} Playlist</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {tracks.map(track => (
                <div key={track.id} className="bg-white rounded-lg shadow hover:shadow-xl transition overflow-hidden border border-gray-100">
                  <img src={track.album.images[1]?.url||track.album.images[0]?.url} alt={track.name} className="w-full h-40 sm:h-48 object-cover" />
                  <div className="p-3 sm:p-4">
                    <h3 className="font-semibold text-gray-800 mb-1 truncate">{track.name}</h3>
                    <p className="text-sm text-gray-600 mb-3 truncate">{track.artists.map(a=>a.name).join(', ')}</p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      {track.preview_url && <button onClick={()=>playPreview(track.preview_url, track.id)} className={`flex-1 py-2 rounded-lg font-semibold transition ${playingTrackId===track.id?'bg-red-500 hover:bg-red-600 text-white':'bg-green-600 hover:bg-green-700 text-white'}`}>{playingTrackId===track.id?'⏸ Stop':'▶ Preview'}</button>}
                      <a href={track.external_urls.spotify} target="_blank" rel="noopener noreferrer" className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-center transition">Open</a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
