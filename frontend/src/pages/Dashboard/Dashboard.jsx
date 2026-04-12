import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import StatCard from "../../components/StatCard";
import { fetchDocumentsRequest } from "../../store/slices/documentSlice";
import { fetchCommitsRequest } from "../../store/slices/commitSlice";

export default function Dashboard() {
  const dispatch = useDispatch();
  const { documents, loading: docsLoading } = useSelector(
    (state) => state.documents,
  );
  const { commits, loading: commitsLoading } = useSelector(
    (state) => state.commits,
  );
  const { projects } = useSelector((state) => state.projects);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchDocumentsRequest());
    dispatch(fetchCommitsRequest());
  }, [dispatch]);

  const userDocuments = user
    ? documents.filter(
        (doc) => doc.createdBy === user.id || doc.lastEditedBy === user.id,
      )
    : [];

  const userCommits = user
    ? commits.filter((commit) => commit.author === user.id)
    : [];

  // Get recent documents (sorted by createdAt)
  const recentDocuments = [...userDocuments]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);

  // Calculate stats
  const totalDocuments = userDocuments.length;
  const totalCommits = userCommits.length;
  const uniqueAuthors = new Set(userCommits.map((c) => c.author)).size;

  const commitsByDay = userCommits.reduce((acc, commit) => {
    const date = new Date(commit.createdAt || commit.updatedAt || Date.now());
    if (Number.isNaN(date.getTime())) return acc;
    const key = date.toISOString().slice(0, 10);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const maxCommitsPerDay = Math.max(...Object.values(commitsByDay), 1);

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto">
      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Documents"
          value={totalDocuments.toLocaleString()}
          growth={`${Math.min(totalDocuments, 100)}%`}
        />
        <StatCard
          title="Recent Commits"
          value={totalCommits.toLocaleString()}
          growth={`+${Math.min(totalCommits, 100)}%`}
        />
        <StatCard
          title="Contributors"
          value={uniqueAuthors}
          growth={`+${Math.min(uniqueAuthors, 50)}%`}
        />
      </div>

      {/* RECENT DOCUMENTS */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Recent Documents</h2>

        {docsLoading ? (
          <div className="text-gray-400">Loading documents...</div>
        ) : recentDocuments.length === 0 ? (
          <div className="bg-[#111827] border border-gray-800 rounded-xl p-8 text-center text-gray-400">
            No documents yet. Create one to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentDocuments.map((doc) => (
              <div
                key={doc.id}
                className="bg-[#111827] border border-gray-800 rounded-xl p-4 hover:border-indigo-500 transition"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs bg-indigo-600 px-2 py-1 rounded">
                    {doc.branch || "main"}
                  </span>
                </div>

                <h3 className="font-medium truncate">{doc.name}</h3>
                <p className="text-xs text-gray-400 mt-2">
                  Updated {new Date(doc.updatedAt).toLocaleDateString()}
                </p>
              </div>
            ))}

            <div className="flex items-center justify-center border border-dashed border-gray-700 rounded-xl h-32 text-gray-400 hover:border-indigo-500 cursor-pointer">
              + Add new item
            </div>
          </div>
        )}
      </div>

      {/* ACTIVITY VISUALIZATION */}
      <div className="bg-[#111827] border border-gray-800 rounded-xl p-6">
        <h2 className="mb-4 font-semibold">Contribution Activity</h2>

        {commitsLoading ? (
          <div className="text-gray-400">Loading activity...</div>
        ) : !user ? (
          <div className="text-center text-gray-400 py-8">
            Sign in to view your contribution history.
          </div>
        ) : userCommits.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            No activity yet. Start committing to see activity here.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-12 gap-1">
              {Array.from({ length: 84 }).map((_, i) => {
                const day = new Date();
                day.setDate(day.getDate() - (83 - i));
                const dayKey = day.toISOString().slice(0, 10);
                const count = commitsByDay[dayKey] || 0;
                const intensity =
                  count === 0
                    ? "bg-gray-800"
                    : `bg-indigo-500/${20 + Math.min(80, Math.floor((count / maxCommitsPerDay) * 80))}`;

                return (
                  <div
                    key={dayKey}
                    title={`${dayKey}: ${count} commit${count === 1 ? "" : "s"}`}
                    className={`w-4 h-4 rounded-sm border border-gray-900 ${intensity}`}
                  ></div>
                );
              })}
            </div>

            <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
              <span>0 commits</span>
              <div className="flex gap-1 items-center">
                <span className="w-4 h-4 rounded-sm bg-indigo-500/20 border border-gray-900"></span>
                <span>few</span>
              </div>
              <div className="flex gap-1 items-center">
                <span className="w-4 h-4 rounded-sm bg-indigo-500 border border-gray-900"></span>
                <span>most</span>
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-4">
              Total Commits: {totalCommits}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
