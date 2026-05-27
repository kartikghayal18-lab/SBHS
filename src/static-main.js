import { initLoginPage, initStudentPage } from "../app.js";

const initializers = {
  login: initLoginPage,
  student: initStudentPage,
};

const page = document.body.dataset.page;

if (page && initializers[page]) {
  initializers[page]();
}
