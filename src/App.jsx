import React, { useState, useEffect } from 'react';
import { Music, LogOut, Smile, Frown, Meh, Heart, Cloud, Flame } from 'lucide-react';

const SPOTIFY_CLIENT_ID = "cadcdebb966f4d3a844d6613579033f6";
const REDIRECT_URI = "https://mood-tunes-three.vercel.app/callback";

const moodQueries = {
  chill: { query: "lofi hip hop study beats relaxing", icon: Cloud, color: "from-purple-400 to-teal-400" },
  happy: { query: "2000s 2010s dance pop katy perry rihanna taylor swift", icon: Smile, color: "from-yellow-400 to-orange-500" },
  sad: { query: "lewis capaldi olivia rodrigo joji sad crying depressing", icon: Frown, color: "from-blue-600 to-blue-900" },
  insecure: { query: "conan gray heather bedroom pop indie sad", icon: Meh, color: "from-teal-400 to-gray-600" },
  burnout: { query: "em beihold marina julia michaels burnt out tired", icon: Cloud, color: "from-gray-700 to-yellow-800" },
  angst: { query: "filipino opm demi slimademidemiislime because leslie hev abi", icon: Flame, color: "from-black to-gray-600" }
};

// Hardcoded track IDs (for demo / offline preview)
const moodTracks = {
  chill: ["7jXwaYTaruWQVmJgjAyVGj","1mJ9oAPuo3hHspOYamtoYc","7eKgcdYbbjQWjphO6IlZ7k"],
  happy: ["455AfCsOhhLPRc68sE01D8","10Igtw8bSDyyFs7KIsKngZ","35mvY5S1H3J2QZyna3TFe0"],
  sad: ["3gdPwk2wyOXNRnTA1KXnEr","5rbuv6zso7QSaKt265H3M3","2gMXnyrvIjhVBUZwvLZDMP"],
  insecure: ["4xqrdfXkTW4T0RauPLv3WA","5CZ40GBx1sQ9agT82CLQCT","69HzZ3ti9DLwb0GdWCGYSo"],
  burnout: ["1KQc37jezhunxnOPhvdwSG","5OKyAO31eOeJV5qEx2lv4k","2bu6TFn64ASDFXocD9HQ38"],
  angst: ["2ADSh3Mp744n2586tpUtIW","0NJAqnvbF6vzripOB7PclP","2tzAN1L07SNwnOdgOEeuQr"]
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

  // Login/signup state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState(null);
  const [users, setUsers] = useState([{ email: 'm@gmail.com', password: '12345', name: 'Demo User' }]);

  useEffect(() => {
    const savedUser = sessionStorage.getItem('moodtunes_user');
    const savedToken = sessionStorage.getItem('spotify_token');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setCurrentPage('app');
    }
    if (savedToken) setSpotifyToken(savedToken);
  }, []);

  useEffect(() => {
    if (user) sessionStorage.setItem('moodtunes_user', JSON.stringify(user));
    else sessionStorage.removeItem('moodtunes_user');
  }, [user]);

  // Spotify callback handler
  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      if (code && !spotifyToken) {
        setLoading(true);
        try {
          const res = await fetch(`/api/spotify-callback?code=${code}`);
          const data = await res.json();
          if (data.access_token) {
            setSpotifyToken(data.access_token);
            sessionStorage.setItem('spotify_token', data.access_token);
            setCurrentPage('app');
            window.history.replaceState({}, document.title, '/');
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    };
    handleCallback();
  }, [spotifyToken]);

  // Login / Signup / Logout
  const handleSignup = (e) => {
    e.preventDefault();
    if (!name || !email || !password) return alert('❌ Fill all fields.');
    if (users.find(u => u.email === email)) return alert('❌ Email exists.');
    setUsers([...users, { name, email, password }]);
    alert('✅ Signup successful!');
    setCurrentPage('login');
  };
  const handleLogin = (e) => {
    e.preventDefault();
    const found = users.find(u => u.email === email && u.password === password);
    if (found) { setUser(found); setCurrentPage('app'); } 
    else alert('❌ Invalid credentials.');
  };
  const handleLogout = () => {
    setUser(null); setSpotifyToken(null); sessionStorage.clear();
    setCurrentPage('login'); setSelectedMood(''); setTracks([]);
    if (currentAudio) { currentAudio.pause(); setCurrentAudio(null); setPlayingTrackId(null); }
  };

  const connectToSpotify = () => {
    const scopes = 'user-read-private user-read-email';
    const url = `https://accounts.spotify.com/authorize?client_id=${SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(scopes)}`;
    window.location.href = url;
  };

  // Forgot password
  const sendResetOtp = () => {
    if (!resetEmail) return alert('❌ Enter email.');
    if (!users.find(u => u.email === resetEmail)) return alert('❌ Email not found.');
    const code = Math.floor(100000 + Math.random() * 900000);
    setGeneratedOtp(code); setOtpSent(true);
    alert(`🔑 Demo OTP: ${code}`);
  };
  const verifyAndResetPassword = () => {
    if (otp !== String(generatedOtp)) return alert('❌ Wrong OTP.');
    if (newPassword.length < 5) return alert('❌ Password too short.');
    setUsers(users.map(u => u.email === resetEmail ? { ...u, password: newPassword } : u));
    alert('✅ Password reset successful!');
    setShowForgotPassword(false); setOtpSent(false); setResetEmail(''); setOtp(''); setNewPassword(''); setGeneratedOtp(null);
  };

  // Fetch playlist (or use hardcoded moodTracks)
  const fetchPlaylist = async (mood) => {
    setSelectedMood(mood);
    setLoading(true);
    try {
      if (spotifyToken) {
        const res = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(moodQueries[mood].query)}&type=track&limit=10`, {
          headers: { Authorization: `Bearer ${spotifyToken}` }
        });
        const data = await res.json();
        setTracks(data.tracks.items);
      } else {
        // Use hardcoded tracks for demo
        const demoTracks = moodTracks[mood].map(id => ({
          id, name: `Track ${id.slice(0,4)}`, preview_url: null, album: { images: [] }, artists: [{ name: 'Artist' }], external_urls: { spotify: `https://open.spotify.com/track/${id}` }
        }));
        setTracks(demoTracks);
      }
    } catch (err) { console.error(err); alert('Failed to fetch tracks'); }
    finally { setLoading(false); }
  };

  const playPreview = (url, trackId) => {
    if (currentAudio) { currentAudio.pause(); setCurrentAudio(null); setPlayingTrackId(null); }
    if (!url || playingTrackId === trackId) return;
    const audio = new Audio(url); audio.play();
    setCurrentAudio(audio); setPlayingTrackId(trackId);
    audio.addEventListener('ended', () => { setCurrentAudio(null); setPlayingTrackId(null); });
  };

  const MoodIcon = selectedMood ? moodQueries[selectedMood].icon : Music;
  const moodGradient = selectedMood ? moodQueries[selectedMood].color : "from-purple-600 to-blue-600";

  // --------------------------- JSX ---------------------------
  if (currentPage === 'login') return (
    <>
      <div className={`min-h-screen bg-gradient-to-br ${moodGradient} flex flex-col justify-center items-center px-4 py-safe`}>
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
          <div className="text-center mb-6">
            <Music size={48} className="mx-auto mb-3 text-purple-600" />
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">MoodTunes</h1>
            <p className="text-sm text-gray-500 mt-2">Your soundtrack for every mood</p>
          </div>
          <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-purple-500 outline-none"/>
          <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-purple-500 outline-none"/>
          <button onClick={handleLogin} className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition">Login</button>
          <div className="mt-4 text-center">
            <button onClick={()=>setShowForgotPassword(true)} className="text-purple-600 text-sm hover:underline">Forgot Password?</button>
          </div>
          <div className="mt-6 text-center text-sm text-gray-600">
            <p className="mb-2">Demo: <strong>m@gmail.com</strong> / <strong>12345</strong></p>
            <p>Don't have an account? <button onClick={()=>setCurrentPage('signup')} className="text-purple-600 font-semibold hover:underline">Sign Up</button></p>
          </div>
        </div>
        {showForgotPassword && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
              {!otpSent ? (
                <div className="space-y-4">
                  <input type="email" placeholder="Email" value={resetEmail} onChange={e=>setResetEmail(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"/>
                  <button onClick={sendResetOtp} className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700">Send Reset Code</button>
                </div>
              ) : (
                <div className="space-y-4">
                  <input type="text" placeholder="Enter 6-digit code" value={otp} onChange={e=>setOtp(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"/>
                  <input type="password" placeholder="New password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"/>
                  <button onClick={verifyAndResetPassword} className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700">Reset Password</button>
                </div>
              )}
              <button onClick={() => { setShowForgotPassword(false); setOtpSent(false); setResetEmail(''); setOtp(''); setNewPassword(''); setGeneratedOtp(null); }} className="mt-4 w-full text-gray-600 py-2 hover:underline">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </>
  );

  if (currentPage === 'signup') return (
    <div className={`min-h-screen bg-gradient-to-br ${moodGradient} flex flex-col justify-center items-center px-4 py-safe`}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
        <div className="text-center mb-6">
          <Music size={48} className="mx-auto mb-3 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-800">Create Account</h1>
        </div>
        <input type="text" placeholder="Full Name" value={name} onChange={e=>setName(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-purple-500 outline-none"/>
        <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-purple-500 outline-none"/>
        <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-purple-500 outline-none"/>
        <button onClick={handleSignup} className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition">Sign Up</button>
        <p className="text-center text-sm text-gray-600 mt-4">Already have an account? <button onClick={()=>setCurrentPage('login')} className="text-purple-600 font-semibold hover:underline">Login</button></p>
      </div>
    </div>
  );

  if (currentPage === 'app') return (
    <div className={`min-h-screen bg-gradient-to-br ${moodGradient} flex flex-col items-center py-12 px-4`}>
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Welcome, {user.name}</h2>
          <button onClick={handleLogout} className="flex items-center gap-2 text-purple-600 hover:text-purple-800 font-semibold">
            <LogOut size={18}/> Logout
          </button>
        </div>

        {/* Mood buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          {Object.keys(moodQueries).map(mood => {
            const Icon = moodQueries[mood].icon;
            return (
              <button key={mood} onClick={()=>fetchPlaylist(mood)} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold hover:scale-105 transition ${selectedMood===mood?'bg-purple-600 text-white':'bg-gray-100 text-gray-800'}`}>
                <Icon size={18}/> {mood.charAt(0).toUpperCase()+mood.slice(1)}
              </button>
            );
          })}
        </div>

        {loading ? <p className="text-center text-gray-500">Loading...</p> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {tracks.map(track => (
              <div key={track.id} className="border rounded-lg p-3 flex flex-col items-center gap-2">
                {track.album.images[0] ? <img src={track.album.images[0].url} alt={track.name} className="w-24 h-24 object-cover rounded-lg"/> :
                  <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">🎵</div>}
                <p className="text-sm font-semibold text-gray-800 text-center">{track.name}</p>
                <p className="text-xs text-gray-500">{track.artists.map(a=>a.name).join(', ')}</p>
                <div className="flex gap-2 mt-2">
                  <button onClick={()=>playPreview(track.preview_url, track.id)} className="px-3 py-1 bg-purple-600 text-white rounded-lg text-xs hover:bg-purple-700 transition">
                    {playingTrackId===track.id?'Pause':'Play'}
                  </button>
                  <a href={track.external_urls.spotify} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-gray-100 text-gray-800 rounded-lg text-xs hover:bg-gray-200 transition">Open</a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
