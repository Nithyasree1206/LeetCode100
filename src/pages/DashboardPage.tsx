import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import problemsData from '../data/problems';
import ProblemCard from '../components/ProblemCard';
import CertificateModal from '../components/CertificateModal';

function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [problemList, setProblemList] = useState(
    problemsData.map((problem) => ({ ...problem, completed: false }))
  );
  const [showCertificate, setShowCertificate] = useState(false);
  const [streak, setStreak] = useState({ count: 0, lastActive: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Completed' | 'Incomplete'>('All');

  const getIsoDate = (date: Date) => date.toISOString().slice(0, 10);
  const isYesterday = (previousDate: string, currentDate: string) => {
    const previous = new Date(previousDate);
    previous.setDate(previous.getDate() + 1);
    return getIsoDate(previous) === currentDate;
  };

  useEffect(() => {
    const stored =
      window.localStorage.getItem('leetcode-dashboard-progress') ||
      window.localStorage.getItem('hundredcode-dashboard-progress');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as { id: number; completed: boolean }[];
        setProblemList((list) =>
          list.map((item) => {
            const storedItem = parsed.find((entry) => entry.id === item.id);
            return storedItem ? { ...item, completed: storedItem.completed } : item;
          })
        );
      } catch {
        // ignore malformed storage
      }
    }

    const streakStored =
      window.localStorage.getItem('leetcode-dashboard-streak') ||
      window.localStorage.getItem('hundredcode-dashboard-streak');
    if (streakStored) {
      try {
        const parsed = JSON.parse(streakStored) as { count: number; lastActive: string };
        setStreak({
          count: Number.isFinite(parsed.count) ? parsed.count : 0,
          lastActive: typeof parsed.lastActive === 'string' ? parsed.lastActive : '',
        });
      } catch {
        // ignore malformed storage
      }
    }
  }, []);

  useEffect(() => {
    const progress = problemList.map(({ id, completed }) => ({ id, completed }));
    window.localStorage.setItem('leetcode-dashboard-progress', JSON.stringify(progress));
  }, [problemList]);

  useEffect(() => {
    window.localStorage.setItem('leetcode-dashboard-streak', JSON.stringify(streak));
  }, [streak]);

  const completedCount = useMemo(
    () => problemList.filter((problem) => problem.completed).length,
    [problemList]
  );

  const difficultyCounts = useMemo(() => {
    const counts = { easy: 0, medium: 0, hard: 0 };
    problemList.forEach((problem) => {
      if (problem.completed) {
        if (problem.difficulty === 'Easy') counts.easy += 1;
        if (problem.difficulty === 'Medium') counts.medium += 1;
        if (problem.difficulty === 'Hard') counts.hard += 1;
      }
    });
    return counts;
  }, [problemList]);

  const badges = useMemo(() => {
    const earned = [];
    if (difficultyCounts.easy >= 30) earned.push('Easy Challenger');
    if (difficultyCounts.medium >= 30) earned.push('Medium Master');
    if (difficultyCounts.hard >= 15) earned.push('Hard Solver');
    if (streak.count >= 5) earned.push('5-Day Streak');
    if (streak.count >= 10) earned.push('10-Day Streak');
    if (streak.count >= 30) earned.push('30-Day Streak');
    if (completedCount === problemList.length) earned.push('100/100 Completion Certificate');
    return earned;
  }, [completedCount, difficultyCounts, problemList.length, streak.count]);

  const filteredProblems = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return problemList.filter((problem) => {
      const matchesSearch =
        problem.title.toLowerCase().includes(normalizedSearch) ||
        problem.topic.toLowerCase().includes(normalizedSearch);

      const matchesDifficulty =
        difficultyFilter === 'All' || problem.difficulty === difficultyFilter;

      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Completed' && problem.completed) ||
        (statusFilter === 'Incomplete' && !problem.completed);

      return matchesSearch && matchesDifficulty && matchesStatus;
    });
  }, [problemList, searchTerm, difficultyFilter, statusFilter]);

  const toggleCompleted = (id: number) => {
    const today = getIsoDate(new Date());

    setProblemList((prev) =>
      prev.map((problem) =>
        problem.id === id ? { ...problem, completed: !problem.completed } : problem
      )
    );

    setStreak((current) => {
      if (current.lastActive === today) {
        return current;
      }

      const count = current.lastActive && isYesterday(current.lastActive, today) ? current.count + 1 : 1;
      return { count, lastActive: today };
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="page-shell dashboard-shell">
      <header className="dashboard-header">
        <div>
          <h1>LeetCode Important 100 Dashboard</h1>
          <p>
            Welcome back, <strong>{user?.name}</strong>. Track the top 100 LeetCode problems, earn badges, and
            unlock a digital certificate when all are complete.
          </p>
        </div>
        <button className="secondary-button" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <section className="stats-grid">
        <div className="stat-card">
          <span className="stat-number">{completedCount}</span>
          <span>Completed problems</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{problemList.length}</span>
          <span>Total problems in list</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{Math.round((completedCount / problemList.length) * 100)}%</span>
          <span>Progress toward certificate</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{streak.count}</span>
          <span>Current activity streak</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{difficultyCounts.easy}</span>
          <span>Completed Easy problems</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{difficultyCounts.medium}</span>
          <span>Completed Medium problems</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{difficultyCounts.hard}</span>
          <span>Completed Hard problems</span>
        </div>
      </section>

      <section className="badges-panel">
        <h2>Badges & achievements</h2>
        <div className="badges-list">
          {badges.length > 0 ? (
            badges.map((badge) => (
              <span key={badge} className="badge badge-earned">
                {badge}
              </span>
            ))
          ) : (
            <span className="badge badge-muted">No badges earned yet — finish problems to earn them.</span>
          )}
        </div>
      </section>

      <section className="controls-row">
        <button
          className="primary-button"
          disabled={completedCount !== problemList.length}
          onClick={() => setShowCertificate(true)}
        >
          View digital certificate
        </button>
        <button
          className="secondary-button"
          onClick={() => navigate('/sample-certificate')}
        >
          View sample certificate
        </button>
        <button
          className="secondary-button"
          onClick={() =>
            setProblemList((prev) => prev.map((problem) => ({ ...problem, completed: false })))
          }
        >
          Reset progress
        </button>
      </section>

      <section className="filter-panel">
        <div className="filter-row">
          <label>
            Search problems
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by title or topic"
            />
          </label>
        </div>
        <div className="filter-row">
          <div className="filter-group">
            <span className="small-label">Difficulty</span>
            {['All', 'Easy', 'Medium', 'Hard'].map((level) => (
              <button
                key={level}
                className={`chip ${difficultyFilter === level ? 'chip-active' : ''}`}
                type="button"
                onClick={() => setDifficultyFilter(level as 'All' | 'Easy' | 'Medium' | 'Hard')}
              >
                {level}
              </button>
            ))}
          </div>
          <div className="filter-group">
            <span className="small-label">Status</span>
            {['All', 'Completed', 'Incomplete'].map((status) => (
              <button
                key={status}
                className={`chip ${statusFilter === status ? 'chip-active' : ''}`}
                type="button"
                onClick={() => setStatusFilter(status as 'All' | 'Completed' | 'Incomplete')}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="problem-grid">
        {filteredProblems.length > 0 ? (
          filteredProblems.map((problem) => (
            <ProblemCard key={problem.id} problem={problem} onToggle={toggleCompleted} />
          ))
        ) : (
          <div className="no-results-card">
            <p>No problems match your filter. Try adjusting the search, difficulty, or status.</p>
          </div>
        )}
      </div>

      {showCertificate && (
        <CertificateModal
          name={user?.name ?? 'LeetCode Learner'}
          completedAt={new Date().toLocaleDateString()}
          totalProblems={problemList.length}
          onClose={() => setShowCertificate(false)}
        />
      )}

      <footer className="developer-footer">
        Last developer: <strong>Nithyasree S</strong>
      </footer>
    </div>
  );
}

export default DashboardPage;
