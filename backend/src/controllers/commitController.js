import Commit from "../models/Commit.js";

export const getCommits = async (req, res) => {
  const commits = await Commit.find({ author: req.user.id }).sort({ createdAt: -1 });
  return res.json(commits);
};

export const createCommit = async (req, res) => {
  const { message, projectId, documentId, branch, snapshot, parentCommit } = req.body;
  if (!message || !projectId || !documentId || !branch) {
    return res.status(400).json({ message: "Commit message, projectId, documentId and branch are required" });
  }

  const commit = await Commit.create({
    message,
    projectId,
    documentId,
    branch,
    author: req.user.id,
    parentCommit: parentCommit || null,
    snapshot: snapshot || "",
  });

  return res.status(201).json(commit);
};
