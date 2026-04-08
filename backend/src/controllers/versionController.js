import Branch from "../models/Branch.js";
import Project from "../models/Project.js";

export const getAllVersions = async (req, res) => {
  const branches = await Branch.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
  return res.status(200).json(branches);
};

export const getVersionById = async (req, res) => {
  const branch = await Branch.findById(req.params.id);
  if (!branch) {
    return res.status(404).json({ message: "Branch not found" });
  }
  if (branch.createdBy !== req.user.id) {
    return res.status(403).json({ message: "Forbidden" });
  }
  return res.status(200).json(branch);
};

export const createVersion = async (req, res) => {
  const { name, projectId } = req.body;
  if (!name || !projectId) {
    return res.status(400).json({ message: "Branch name and projectId are required" });
  }

  const project = await Project.findById(projectId);
  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }
  if (project.owner !== req.user.id) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const branchName = name.trim();
  const existingBranch = await Branch.findOne({ name: branchName, projectId });
  if (existingBranch) {
    return res.status(400).json({ message: "Branch already exists" });
  }

  const branch = await Branch.create({
    name: branchName,
    projectId,
    createdBy: req.user.id,
  });

  if (!project.branches.includes(branchName)) {
    project.branches.push(branchName);
  }
  project.currentBranch = branchName;
  await project.save();

  return res.status(201).json(branch);
};

export const deleteVersion = async (req, res) => {
  const branch = await Branch.findById(req.params.id);
  if (!branch) {
    return res.status(404).json({ message: "Branch not found" });
  }
  if (branch.createdBy !== req.user.id) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const project = await Project.findById(branch.projectId);
  if (project) {
    project.branches = project.branches.filter((b) => b !== branch.name);
    if (project.currentBranch === branch.name) {
      project.currentBranch = project.branches.length ? project.branches[0] : "main";
    }
    await project.save();
  }

  await branch.remove();
  return res.status(200).json({ message: "Branch deleted" });
};
