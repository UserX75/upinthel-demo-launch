import { createContext, useContext, useState, useRef, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const MusicPlayerContext = createContext();

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (!context) throw new Error('useMusicPlayer must be used within MusicPlayerProvider');
  return context;
};

export const MusicPlayerProvider = ({ children }) => {
  const { user, userRole } = useAuth();
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isAdPlaying, setIsAdPlaying] = useState(false);
  const [currentAdId, setCurrentAdId] = useState(null);
  const [songCount, setSongCount] = useState(0);
  const audioRef = useRef(new Audio());

  const currentItem = currentIndex >= 0 ? queue[currentIndex] : null;
  const isPremium = userRole === 'premium';

  const getSignedUrl = async (songId) => {
    const res = await api.get(`/api/music/signed-url/${songId}`);
    return res.data.signed_url;
  };

  const fetchNextAd = async () => {
    const res = await api.get('/api/ads/next');
    return { url: res.data.ad_url, id: res.data.ad_id };
  };

  const playSong = async (song) => {
    if (!isPremium && songCount >= 3 && queue.length === 0) {
      setSongCount(0);
      const ad = await fetchNextAd();
      if (ad.url) {
        setQueue([{ type: 'ad', url: ad.url, id: ad.id, songInfo: song }]);
        setCurrentIndex(0);
        audioRef.current.src = ad.url;
        audioRef.current.play();
        setIsPlaying(true);
        setIsAdPlaying(true);
        setCurrentAdId(ad.id);
        api.post('/api/ads/impression', { ad_id: ad.id, was_skipped: false, duration_played: 0 });
        return;
      }
    }
    const signedUrl = await getSignedUrl(song.id);
    const newQueue = [...queue, { type: 'song', url: signedUrl, songInfo: song }];
    setQueue(newQueue);
    if (currentIndex === -1) {
      setCurrentIndex(0);
      audioRef.current.src = signedUrl;
      audioRef.current.play();
      setIsPlaying(true);
      setIsAdPlaying(false);
    }
  };

  const pause = () => { audioRef.current.pause(); setIsPlaying(false); };
  const resume = () => { audioRef.current.play(); setIsPlaying(true); };
  const stop = () => {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setQueue([]);
    setCurrentIndex(-1);
    setIsPlaying(false);
    setIsAdPlaying(false);
    setCurrentAdId(null);
    setSongCount(0);
  };

  const next = () => {
    if (currentIndex + 1 < queue.length) {
      const nextItem = queue[currentIndex + 1];
      setCurrentIndex(currentIndex + 1);
      audioRef.current.src = nextItem.url;
      audioRef.current.play();
      setIsPlaying(true);
      if (nextItem.type === 'ad') {
        setIsAdPlaying(true);
        setCurrentAdId(nextItem.id);
        api.post('/api/ads/impression', { ad_id: nextItem.id, was_skipped: false, duration_played: 0 });
      } else {
        setIsAdPlaying(false);
        setCurrentAdId(null);
      }
    } else {
      stop();
    }
  };

  const prev = () => {}; // optionally implement

  const seek = (value) => {
    const seconds = value * duration;
    audioRef.current.currentTime = seconds;
    setCurrentTime(seconds);
  };

  const handleVolume = (value) => {
    const vol = parseFloat(value);
    setVolume(vol);
    audioRef.current.volume = vol;
  };

  const skipAd = () => {
    if (isAdPlaying && currentItem?.type === 'ad') {
      api.post('/api/ads/impression', { ad_id: currentAdId, was_skipped: true, duration_played: currentTime });
      next();
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const onEnded = () => {
      if (currentItem?.type === 'ad') {
        api.post('/api/ads/impression', { ad_id: currentAdId, was_skipped: false, duration_played: duration });
        next();
      } else {
        setSongCount(prev => prev + 1);
        next();
      }
    };
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', onEnded);
    audio.volume = volume;
    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', onEnded);
    };
  }, [currentItem, currentAdId, duration, volume]);

  return (
    <MusicPlayerContext.Provider
      value={{
        currentSong: currentItem?.type === 'song' ? currentItem.songInfo : null,
        isPlaying,
        currentTime,
        duration,
        volume,
        playSong,
        pause,
        resume,
        stop,
        next,
        prev,
        seek,
        setVolume: handleVolume,
        isAdPlaying,
        skipAd,
      }}
    >
      {children}
    </MusicPlayerContext.Provider>
  );
};