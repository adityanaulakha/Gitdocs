import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";

import {
  fetchProjectsRequest,
  fetchProjectsSuccess,
  fetchProjectsFailure,
  createProjectRequest,
  createProjectSuccess,
  createProjectFailure,
} from "../slices/projectSlice";
import { projectApiService } from "../../services/ProjectApiService";

function* fetchProjects() {
  try {
    const response = yield call(projectApiService.getAllProjects);
    yield put(fetchProjectsSuccess(response));
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    yield put(fetchProjectsFailure(message));
    toast.error("Failed to load projects: " + message);
  }
}

function* createProject(action) {
  try {
    const response = yield call(projectApiService.createProject, action.payload);
    yield put(createProjectSuccess(response));
    toast.success("Project created successfully!");
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    yield put(createProjectFailure(message));
    toast.error("Failed to create project: " + message);
  }
}

export default function* projectSaga() {
  yield takeLatest(fetchProjectsRequest.type, fetchProjects);
  yield takeLatest(createProjectRequest.type, createProject);
}