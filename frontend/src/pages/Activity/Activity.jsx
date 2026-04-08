import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Activity, GitCommit, Download } from "lucide-react";
import { fetchCommitsRequest } from "../../store/slices/commitSlice";

const ITEMS_PER_PAGE = 15;

export default function ActivityPage() {
  const dispatch = useDispatch();
  const { commits, loading, error } = useSelector((state) => state.commits);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState("all");
  const [filterProject, setFilterProject] = useState("");

  const { projects } = useSelector((state) => state.projects);

  useEffect(() => {
    dispatch(fetchCommitsRequest());
  }, [dispatch]);

  // Filter commits based on project and type
  const filteredCommits = commits.filter((commit) => {
    const matchesType = filterType === "all" || commit.type === filterType;
    const matchesProject = !filterProject || commit.projectId == filterProject;
    return matchesType && matchesProject;
  });

  const totalPages = Math.ceil(filteredCommits.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentActivities = filteredCommits.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const getActivityIcon = (type) => {
    switch (type) {
      case "create":
        return "📄";
      case "update":
        return "✏️";
      case "delete":
        return "🗑️";
      case "commit":
        return "💾";
      default:
        return "📌";
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case "create":
        return "text-green-500";
      case "update":
        return "text-blue-500";
      case "delete":
        return "text-red-500";
      case "commit":
        return "text-indigo-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="bg-[#0B0F19] min-h-screen text-white">
      <div className="ml-64 pt-20 px-6 space-y-6">
        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-bold">Activity Log</h1>
          <p className="text-sm text-gray-400">
            Track all commits, updates, and changes
          </p>
        </div>

        {/* FILTERS */}
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4 flex gap-4 flex-wrap">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">
              Activity Type
            </label>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#0B0F19] border border-gray-700 rounded px-3 py-2 text-white text-sm"
            >
              <option value="all">All Activities</option>
              <option value="create">Created</option>
              <option value="update">Updated</option>
              <option value="delete">Deleted</option>
              <option value="commit">Commits</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">
              Project
            </label>
            <select
              value={filterProject}
              onChange={(e) => {
                setFilterProject(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#0B0F19] border border-gray-700 rounded px-3 py-2 text-white text-sm"
            >
              <option value="">All Projects</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-600 text-white p-3 rounded">{error}</div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-400">Loading activity...</div>
          </div>
        ) : filteredCommits.length === 0 ? (
          <div className="bg-[#111827] border border-gray-800 rounded-xl p-12 text-center">
            <Activity size={48} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400">No activities found.</p>
          </div>
        ) : (
          <>
            {/* ACTIVITY TIMELINE */}
            <div className="space-y-4">
              {currentActivities.map((activity, index) => (
                <div
                  key={activity.id || index}
                  className="bg-[#111827] border border-gray-800 rounded-xl p-4 flex gap-4"
                >
                  {/* LEFT - ICON & LINE */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`text-2xl ${getActivityColor(activity.type)}`}
                    >
                      {getActivityIcon(activity.type)}
                    </div>
                    {index !== currentActivities.length - 1 && (
                      <div className="w-0.5 h-12 bg-gray-800 mt-2"></div>
                    )}
                  </div>

                  {/* RIGHT - CONTENT */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{activity.message}</h3>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          <span className="text-xs bg-indigo-600/20 text-indigo-300 px-2 py-1 rounded">
                            {activity.type}
                          </span>
                          {activity.branch && (
                            <span className="text-xs bg-purple-600/20 text-purple-300 px-2 py-1 rounded">
                              {activity.branch}
                            </span>
                          )}
                          {activity.documentId && (
                            <span className="text-xs bg-blue-600/20 text-blue-300 px-2 py-1 rounded">
                              Doc: {activity.documentId}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">
                          {activity.authorName || "System"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(activity.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-800 text-gray-400 rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm text-gray-400">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-gray-800 text-gray-400 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* ACTIVITY STATS */}
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Activity Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-500">
                {commits.filter((c) => c.type === "commit").length}
              </p>
              <p className="text-xs text-gray-400 mt-1">Total Commits</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">
                {commits.filter((c) => c.type === "create").length}
              </p>
              <p className="text-xs text-gray-400 mt-1">Created</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-500">
                {commits.filter((c) => c.type === "update").length}
              </p>
              <p className="text-xs text-gray-400 mt-1">Updated</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">
                {commits.filter((c) => c.type === "delete").length}
              </p>
              <p className="text-xs text-gray-400 mt-1">Deleted</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
