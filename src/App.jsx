import React, { useState, useEffect } from 'react';
import { Music, LogOut, Smile, Frown, Meh, Heart, Cloud, Flame } from 'lucide-react';
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

  // Auth states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState(null);

  // In-memory user storage
  const [users, setUsers] = useState([{ email: 'm@gmail.com', password: '12345', name: 'Demo User' }]);

  // Load user session
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

  // Spotify OAuth callback
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

  const connectToSpotify = () => {
    const scopes = 'user-read-private user-read-email';
    const url = `https://accounts.spotify.com/authorize?client_id=${SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(scopes)}`;
    window.location.href = url;
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
    alert('Password reset success!'); setShowForgotPassword(false); setResetEmail(''); setOtp(''); setNewPassword(''); setOtpSent(false); setGeneratedOtp(null);
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

  const MoodIcon = selectedMood ? moodQueries[selectedMood].icon : Music;
  const moodGradient = selectedMood ? moodQueries[selectedMood].color : "from-purple-600 to-blue-600";

  // ---- RENDER ----
  if (currentPage === 'login') return (
    <div className={`min-h-screen bg-gradient-to-br ${moodGradient} flex items-center justify-center p-6`}>
      {/* LOGIN FORM */}
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

  // MAIN APP
  return (
    <div className={`min-h-screen bg-gradient-to-br ${moodGradient} p-6`}>
      <div className="max-w-6xl mx-auto">
        <div className="bg-white p-6 rounded-2xl shadow mb-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <MoodIcon size={40} className="text-purple-600"/>
            <h1 className="text-2xl font-bold">MoodTunes - {user?.name}</h1>
          </div>
          <button onClick={handleLogout} className="py-2 px-4 bg-red-500 text-white rounded flex items-center gap-2"><LogOut size={16}/>Logout</button>
        </div>

        {!spotifyToken ? (
          <button onClick={connectToSpotify} className="w-full py-3 bg-green-600 text-white rounded mb-6">🎵 Connect Spotify</button>
        ) : (
          <p className="bg-green-50 border border-green-200 p-4 rounded mb-6 text-green-700">✅ Connected to Spotify</p>
        )}

        <h2 className="text-xl font-bold mb-4">Select Your Mood</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {Object.entries(moodQueries).map(([mood,{icon:Icon}])=>(
            <button key={mood} onClick={()=>fetchMoodTracks(mood)} className={`p-4 border rounded ${selectedMood===mood?'border-purple-600 bg-purple-50':'border-gray-200 hover:border-purple-400'}`}>
              <Icon size={32} className="mx-auto mb-2"/>
              <p className="capitalize text-center">{mood}</p>
            </button>
          ))}
        </div>

        {loading && <p>Loading playlist...</p>}

        {!loading && tracks.length>0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">{selectedMood.charAt(0).toUpperCase()+selectedMood.slice(1)} Playlist</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tracks.map(track=>(
                <div key={track.id} className="border rounded shadow p-4">
                  <img src={track.album.images[1]?.url||track.album.images[0]?.url} alt={track.name} className="w-full h-48 object-cover mb-2"/>
                  <h3 className="font-semibold mb-1 truncate">{track.name}</h3>
                  <p className="text-sm mb-2 truncate">{track.artists.map(a=>a.name).join(', ')}</p>
                  <div className="flex gap-2">
                    {track.preview_url && <button onClick={()=>playPreview(track.preview_url,track.id)} className={`flex-1 py-2 rounded ${playingTrackId===track.id?'bg-red-500':'bg-green-600'} text-white`}>{playingTrackId===track.id?'⏸ Stop':'▶ Preview'}</button>}
                    <a href={track.external_urls.spotify} target="_blank" rel="noopener noreferrer" className="flex-1 py-2 bg-purple-600 rounded text-white text-center">Open</a>
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
