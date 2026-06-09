import { createContext, useContext, useState, useRef, useEffect } from 'react';

const MusicPlayerContext = createContext();

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (!context) throw new Error('useMusicPlayer must be used within MusicPlayerProvider');
  return context;
};

export const MusicPlayerProvider = ({ children }) => {
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const audioRef = useRef(new Audio());

  const currentSong = currentIndex >= 0 ? queue[currentIndex] : null;

  const playSong = (song) => {
    const existingIndex = queue.findIndex(s => s.id === song.id);
    if (existingIndex >= 0) {
      setCurrentIndex(existingIndex);
    } else {
      setQueue(prev => [...prev, song]);
      setCurrentIndex(queue.length);
    }
    audioRef.current.src = song.audio_url;
    audioRef.current.play().catch(e => console.warn('Autoplay prevented', e));
    setIsPlaying(true);
  };

  const pause = () => {
    audioRef.current.pause();
    setIsPlaying(false);
  };

  const resume = () => {
    audioRef.current.play();
    setIsPlaying(true);
  };

  const stop = () => {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setCurrentIndex(-1);
    setQueue([]);
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const next = () => {
    if (currentIndex + 1 < queue.length) {
      const nextSong = queue[currentIndex + 1];
      setCurrentIndex(currentIndex + 1);
      audioRef.current.src = nextSong.audio_url;
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      stop();
    }
  };

  const prev = () => {
    if (currentIndex - 1 >= 0) {
      const prevSong = queue[currentIndex - 1];
      setCurrentIndex(currentIndex - 1);
      audioRef.current.src = prevSong.audio_url;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

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

  useEffect(() => {
    const audio = audioRef.current;
    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const ended = () => next();
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', ended);
    audio.volume = volume;
    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', ended);
    };
  }, [next, volume]);

  return (
    <MusicPlayerContext.Provider
      value={{
        currentSong,
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
      }}
    >
      {children}
    </MusicPlayerContext.Provider>
  );
};