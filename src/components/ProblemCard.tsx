import { Problem } from '../data/problems';

interface Props {
  problem: Problem & { completed: boolean };
  onToggle: (id: number) => void;
}

const difficultyClass = (difficulty: string) => {
  switch (difficulty) {
    case 'Easy':
      return 'pill easy';
    case 'Medium':
      return 'pill medium';
    case 'Hard':
      return 'pill hard';
    default:
      return 'pill';
  }
};

const getProblemUrl = (title: string) => {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return `https://leetcode.com/problems/${slug}`;
};

function ProblemCard({ problem, onToggle }: Props) {
  const problemUrl = getProblemUrl(problem.title);

  return (
    <article className={`problem-card ${problem.completed ? 'completed' : ''}`}>
      <header className="problem-card-header">
        <span className="problem-id">#{problem.id}</span>
        <span className={difficultyClass(problem.difficulty)}>{problem.difficulty}</span>
      </header>
      <h3>
        <a href={problemUrl} target="_blank" rel="noreferrer noopener" className="problem-link">
          {problem.title}
        </a>
      </h3>
      <p className="topic-tag">{problem.topic}</p>
      <div className="problem-card-actions">
        <a
          className="chip"
          href={problemUrl}
          target="_blank"
          rel="noreferrer noopener"
        >
          Open on LeetCode
        </a>
        <button className="chip" onClick={() => onToggle(problem.id)}>
          {problem.completed ? 'Mark not complete' : 'Mark complete'}
        </button>
      </div>
    </article>
  );
}

export default ProblemCard;
