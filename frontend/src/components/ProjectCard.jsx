import { useState } from 'react';
import ProjectModal from './ProjectModal';

export default function ProjectCard({ project }) {
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <>
      <div className="project-card" onClick={() => setModalOpen(true)}>
        <img src={project.cover_image} alt={project.title} />
        <h3>{project.title}</h3>
        <p>{project.project_type} · {project.completion_year}</p>
        <span className="price">M{project.price}</span>
      </div>
      {modalOpen && <ProjectModal project={project} onClose={() => setModalOpen(false)} />}
    </>
  );
}