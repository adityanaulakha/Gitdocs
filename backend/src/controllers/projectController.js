import Project from "../models/Project.js";

export const getProjects = async (req, res) => {
  const projects = await Project.find({ owner: req.user.id }).sort({ updatedAt: -1 });
  return res.json(projects);
};

export const getProjectById = async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }
  if (project.owner !== req.user.id) {
    return res.status(403).json({ message: "Forbidden" });
  }
  return res.json(project);
};

export const createProject = async (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ message: "Project name is required" });
  }

  const project = await Project.create({
    name,
    description: description || "Git-aware document repository",
    owner: req.user.id,
    branches: ["main"],
    currentBranch: "main",
  });

  return res.status(201).json(project);
};

export const updateProject = async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }
  if (project.owner !== req.user.id) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const { name, description, currentBranch, branches } = req.body;

  if (name) project.name = name;
  if (description !== undefined) project.description = description;
  if (currentBranch) project.currentBranch = currentBranch;
  if (Array.isArray(branches)) {
    project.branches = Array.from(new Set([...project.branches, ...branches]));
  }

  await project.save();
  return res.json(project);
};

export const deleteProject = async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }
  if (project.owner !== req.user.id) {
    return res.status(403).json({ message: "Forbidden" });
  }

  await project.deleteOne();
  return res.json({ message: "Project deleted" });
};
