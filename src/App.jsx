import React, { useState, useEffect } from 'react';
import { Music, LogOut, Smile, Frown, Meh, Cloud, Flame } from 'lucide-react';
import axios from 'axios';

// Spotify OAuth Config
const SPOTIFY_CLIENT_ID = "cadcdebb966f4d3a844d6613579033f6";
const REDIRECT_URI = "https://mood-tunes-three.vercel.app/callback";

// Mood icons, colors, and pre-defined playlists
const moodQueries = {
  chill: { icon: Cloud, color: "from-purple-400 to-teal-400" },
  happy: { icon: Smile, color: "from-yellow-400 to-orange-500" },
  sad: { icon: Frown, color: "from-blue-600 to-blue-900" },
  insecure: { icon: Meh, color: "from-teal-400 to-gray-600" },
  burnout: { icon: Cloud, color: "from-gray-700 to-yellow-800" },
  angst: { icon: Flame, color: "from-black to-gray-600" }
};

const moodTracks = {
  chill: ["7jXwaYTaruWQVmJgjAyVGj","1mJ9oAPuo3hHspOYamtoYc","7eKgcdYbbjQWjphO6IlZ7k"],
  happy: ["455AfCsOhhLPRc68sE01D8","10Igtw8bSDyyFs7KIsKngZ","35mvY5S1H3J2QZyna3TFe0"],
  sad: ["3gdPwk2wyOXNRnTA1KXnEr","5rbuv6zso7QSaKt265H3M3","2gMXnyrvIjhVBUZwvLZDMP"],
  insecure: ["4xqrdfXkTW4T0RauPLv3WA","5CZ40GBx1sQ9agT82CLQCT","69HzZ3ti9DLwb0GdWCGYSo"],
  burnout: ["1KQc37jezhunxnOPhvdwSG","5OKyAO31eOeJV5qEx2lv4k","2bu6TFn64ASDFXocD9HQ38"],
  angst: ["2ADSh3Mp744n2586tpUtIW","0NJAqnvbF6vzripOB7PclP","2tzAN1L07SNwnOdgOEeuQr"]
};

export default function MoodTunes() {
  // --- Auth & User State ---
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([{ email: 'm@gmail.com', password: '12345', name: 'Demo User' }]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState(null);

  // --- Spotify & Music State ---
  const [spotifyToken, setSpotifyToken] = useState(null);
  const [selectedMood, setSelectedMood] = useState('');
  const [tracks, setTracks] = useState([]);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [playingTrackId, setPlayingTrackId] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- Load user session ---
  useEffect(() => {
    const savedUser = sessionStorage.getItem('moodtunes_user');
    const savedToken = sessionStorage.getItem('spotify_token');
    if (savedUser) { setUser(JSON.parse(savedUser)); setCurrentPage('app'); }
    if (savedToken) setSpotifyToken(savedToken);
  }, []);

  useEffect(() => {
    if (user) sessionStorage.setItem('moodtunes_user', JSON.stringify(user));
    else sessionStorage.removeItem('moodtunes_user');
  }, [user]);

  // --- Spotify OAuth Callback ---
  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code'); if (!code) return;
      if (spotifyToken) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/spotify-callback?code=${code}`);
        const data = await res.json();
        if (data.access_token) {
          setSpotifyToken(data.access_token);
          sessionStorage.setItem('spotify_token', data.access_token);
        }
        window.history.replaceState({}, document.title, '/');
      } catch (err) { console.error(err); alert('Spotify auth failed'); }
      finally { setLoading(false); }
    };
    handleCallback();
  }, [spotifyToken]);

  // --- Auth Handlers ---
  const handleSignup = (e) => {
    e.preventDefault();
    if (!name || !email || !password) return alert('Fill all fields');
    if (users.find(u => u.email === email)) return alert('Email exists');
    setUsers([...users, { name, email, password }]);
    alert('Signup success!');
    setCurrentPage('login'); setName(''); setEmail(''); setPassword('');
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const foundUser = users.find(u => u.email === email && u.password === password);
    if (foundUser) { setUser(foundUser); setCurrentPage('app'); setEmail(''); setPassword(''); }
    else alert('Invalid credentials');
  };

  const handleLogout = () => {
    setUser(null); setSpotifyToken(null); sessionStorage.removeItem('moodtunes_user'); sessionStorage.removeItem('spotify_token');
    setCurrentPage('login'); setSelectedMood(''); setTracks([]);
    if (currentAudio) { currentAudio.pause(); setCurrentAudio(null); setPlayingTrackId(null); }
  };

  const sendResetOtp = () => {
    if (!resetEmail) return alert('Enter email');
    const userExists = users.find(u => u.email === resetEmail);
    if (!userExists) return alert('No account found');
    const code = Math.floor(100000 + Math.random() * 900000);
    setGeneratedOtp(code); setOtpSent(true); alert(`Demo OTP: ${code}`);
  };

  const verifyAndResetPassword = () => {
    if (otp !== String(generatedOtp)) return alert('Incorrect OTP');
    if (newPassword.length < 5) return alert('Password too short');
    setUsers(users.map(u => u.email === resetEmail ? { ...u, password: newPassword } : u));
    alert('Password reset success!'); 
    setShowForgotPassword(false); setResetEmail(''); setOtp(''); setNewPassword(''); setOtpSent(false); setGeneratedOtp(null);
  };

  // --- Spotify Handlers ---
  const connectToSpotify = () => {
    const scopes = 'user-read-private user-read-email';
    const url = `https://accounts.spotify.com/authorize?client_id=${SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(scopes)}`;
    window.location.href = url;
  };

  const fetchMoodTracks = async (mood) => {
    if (!spotifyToken) return alert('Connect Spotify first');
    setSelectedMood(mood); setLoading(true); setTracks([]);
    try {
      const ids = moodTracks[mood].join(',');
      const res = await axios.get(`https://api.spotify.com/v1/tracks?ids=${ids}`, { headers: { Authorization: `Bearer ${spotifyToken}` } });
      setTracks(res.data.tracks);
    } catch (err) { console.error(err); alert('Failed to fetch tracks'); }
    finally { setLoading(false); }
  };

  const playPreview = (url, trackId) => {
    if (currentAudio) { currentAudio.pause(); setCurrentAudio(null); setPlayingTrackId(null); }
    if (playingTrackId === trackId) return;
    const audio = new Audio(url); audio.play(); setCurrentAudio(audio); setPlayingTrackId(trackId);
    audio.addEventListener('ended', () => { setCurrentAudio(null); setPlayingTrackId(null); });
  };

  // --- UI ---
  const MoodIcon = selectedMood ? moodQueries[selectedMood].icon : Music;
  const moodGradient = selectedMood ? moodQueries[selectedMood].color : "from-purple-600 to-blue-600";

  // --- Login Page ---
  if (currentPage === 'login') return (
    <div className={`min-h-screen bg-gradient-to-br ${moodGradient} flex items-center justify-center p-6`}>
      <div className="bg-white rounded-2xl shadow p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 border rounded mb-3"/>
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 border rounded mb-3"/>
        <button onClick={handleLogin} className="w-full py-3 bg-purple-600 text-white rounded mb-2">Login</button>
        <button onClick={() => setShowForgotPassword(true)} className="text-purple-600 hover:underline">Forgot Password?</button>
        <p className="mt-3 text-sm">Demo: m@gmail.com / 12345</p>
        <p className="mt-1 text-sm">No account? <button onClick={() => setCurrentPage('signup')} className="text-purple-600 hover:underline">Sign Up</button></p>
      </div>

      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            {!otpSent ? (
              <>
                <h3 className="text-lg font-bold mb-3">Reset Password</h3>
                <input type="email" placeholder="Email" value={resetEmail} onChange={e=>setResetEmail(e.target.value)} className="w-full p-3 border rounded mb-3"/>
                <button onClick={sendResetOtp} className="w-full py-3 bg-purple-600 text-white rounded">Send OTP</button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold mb-3">Enter OTP & New Password</h3>
                <input type="text" placeholder="OTP" value={otp} onChange={e=>setOtp(e.target.value)} className="w-full p-3 border rounded mb-3"/>
                <input type="password" placeholder="New Password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} className="w-full p-3 border rounded mb-3"/>
                <button onClick={verifyAndResetPassword} className="w-full py-3 bg-purple-600 text-white rounded">Reset</button>
              </>
            )}
            <button onClick={()=>{setShowForgotPassword(false); setOtpSent(false);}} className="w-full mt-3 py-2 text-gray-600 hover:underline">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );

  // --- Signup Page ---
  if (currentPage === 'signup') return (
    <div className={`min-h-screen bg-gradient-to-br ${moodGradient} flex items-center justify-center p-6`}>
      <div className="bg-white rounded-2xl shadow p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
        <input type="text" placeholder="Full Name" value={name} onChange={e=>setName(e.target.value)} className="w-full p-3 border rounded mb-3"/>
        <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-3 border rounded mb-3"/>
        <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full p-3 border rounded mb-3"/>
        <button onClick={handleSignup} className="w-full py-3 bg-purple-600 text-white rounded mb-2">Sign Up</button>
        <p className="mt-1 text-sm">Already have an account? <button onClick={()=>setCurrentPage('login')} className="text-purple-600 hover:underline">Login</button></p>
      </div>
    </div>
  );

  // --- Main App Page ---
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-700">MoodTunes</h1>
        <div className="flex items-center gap-4">
          {spotifyToken ? null : <button onClick={connectToSpotify} className="py-2 px-4 bg-green-500 text-white rounded">Connect Spotify</button>}
          <button onClick={handleLogout} className="p-2 bg-red-500 rounded text-white"><LogOut size={20}/></button>
        </div>
      </header>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Select Your Mood</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.keys(moodQueries).map(mood => {
            const Icon = moodQueries[mood].icon;
            return (
              <button key={mood} onClick={()=>fetchMoodTracks(mood)}
                className={`flex flex-col items-center justify-center p-4 rounded-xl text-white bg-gradient-to-br ${moodQueries[mood].color} shadow`}>
                <Icon size={32} className="mb-2"/>
                <span className="capitalize font-semibold">{mood}</span>
              </button>
            )
          })}
        </div>
      </section>

      <section>
        {loading && <p className="text-gray-600">Loading tracks...</p>}
        {tracks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tracks.map(track => (
              <div key={track.id} className="flex items-center gap-4 p-3 bg-white rounded shadow">
                {track.album.images[0] && <img src={track.album.images[0].url} alt={track.name} className="w-16 h-16 rounded"/>}
                <div className="flex-1">
                  <p className="font-semibold">{track.name}</p>
                  <p className="text-sm text-gray-500">{track.artists.map(a=>a.name).join(', ')}</p>
                </div>
                {track.preview_url && (
                  <button onClick={()=>playPreview(track.preview_url, track.id)} className="p-2 bg-purple-600 text-white rounded">
                    {playingTrackId === track.id ? 'Pause' : 'Play'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
