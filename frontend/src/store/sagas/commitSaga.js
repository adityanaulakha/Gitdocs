import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";

import {
  fetchCommitsRequest,
  fetchCommitsSuccess,
  fetchCommitsFailure,
  createCommitRequest,
  createCommitSuccess,
  createCommitFailure,
} from "../slices/commitSlice";
import { commitApiService } from "../../services/CommitApiService";

function* fetchCommits() {
  try {
    const response = yield call(commitApiService.getAllCommits);
    yield put(fetchCommitsSuccess(response));
  } catch (error) {
    yield put(fetchCommitsFailure(error.message));
  }
}

function* createCommit(action) {
  try {
    const response = yield call(commitApiService.createCommit, action.payload);
    yield put(createCommitSuccess(response));
    toast.success("Commit created successfully!");
  } catch (error) {
    yield put(createCommitFailure(error.message));
    toast.error("Failed to create commit: " + error.message);
  }
}

export default function* commitSaga() {
  yield takeLatest(fetchCommitsRequest.type, fetchCommits);
  yield takeLatest(createCommitRequest.type, createCommit);
}
