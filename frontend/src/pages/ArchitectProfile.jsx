import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ProjectCard from '../components/ProjectCard';
import './Architecture.css';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function ArchitectProfile() {
  const { id } = useParams();
  const [architect, setArchitect] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArchitect();
    fetchProjects();
  }, [id]);

  const fetchArchitect = async () => {
    const res = await axios.get(`${API_BASE}/api/architects/${id}`);
    setArchitect(res.data);
  };
  const fetchProjects = async () => {
    const res = await axios.get(`${API_BASE}/api/architects/${id}/projects`);
    setProjects(res.data);
    setLoading(false);
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!architect) return <div>Architect not found</div>;

  return (
    <div className="architect-profile">
      <div className="profile-header">
        <img src={architect.logo_url || '/architect-placeholder.png'} alt={architect.company_name} className="profile-logo" />
        <div>
          <h1>{architect.company_name}</h1>
          <p>{architect.location} · {architect.is_verified && '✅ Verified'}</p>
          <p>{architect.bio}</p>
          {architect.website && <a href={architect.website} target="_blank" rel="noopener noreferrer">Website</a>}
        </div>
      </div>
      <h2>Projects</h2>
      <div className="projects-grid">
        {projects.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}