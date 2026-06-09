import Draggable from 'react-draggable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause, faStepBackward, faStepForward, faStop, faVolumeUp, faVolumeMute } from '@fortawesome/free-solid-svg-icons';
import { useMusicPlayer } from '../context/MusicPlayerContext';

export default function MusicPlayer() {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    pause,
    resume,
    stop,
    next,
    prev,
    seek,
    setVolume,
  } = useMusicPlayer();

  if (!currentSong) return null;

  const formatTime = (sec) => {
    if (!sec || isNaN(sec)) return '0:00';
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <Draggable>
      <div className="music-player-floating">
        <div className="player-info">
          <img src={currentSong.cover_image} alt={currentSong.title} />
          <div>
            <div className="player-title">{currentSong.title}</div>
            <div className="player-artist">{currentSong.artist || currentSong.artists?.name}</div>
          </div>
        </div>
        <div className="player-controls">
          <button onClick={prev} title="Previous"><FontAwesomeIcon icon={faStepBackward} /></button>
          {isPlaying ? (
            <button onClick={pause} title="Pause"><FontAwesomeIcon icon={faPause} /></button>
          ) : (
            <button onClick={resume} title="Play"><FontAwesomeIcon icon={faPlay} /></button>
          )}
          <button onClick={stop} title="Stop"><FontAwesomeIcon icon={faStop} /></button>
          <button onClick={next} title="Next"><FontAwesomeIcon icon={faStepForward} /></button>
        </div>
        <div className="player-progress">
          <span className="time-current">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.001"
            value={progressPercent / 100}
            onChange={(e) => seek(parseFloat(e.target.value))}
            className="seek-slider"
          />
          <span className="time-duration">{formatTime(duration)}</span>
        </div>
        <div className="player-volume">
          <button onClick={() => setVolume(volume === 0 ? 0.7 : 0)}>
            <FontAwesomeIcon icon={volume === 0 ? faVolumeMute : faVolumeUp} />
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="volume-slider"
          />
        </div>
      </div>
    </Draggable>
  );
}