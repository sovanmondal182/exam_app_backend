const { handleError, handleSuccess } = require("../utils/handleResponse");
const Student = require("../models/student");
const Exam = require("../models/exam");

exports.getStudentByID = (req, res, next, id) => {
  Student.findById(id, (err, student) => {
    if (err || !student) handleError(res, "Student not found!", 400);
    req.student = student;
    next();
  });
};

exports.submitExam = (req, res) => {
  try {
    const { examId, answers } = req.body;

    const student = new Student(req.student);
    console.log(examId, answers);
    student.submittedExams[examId] = answers;
    student.save((err, student) => {
      if (err) handleError(res, "Error submitting Exam!");
      if (student) {
        Exam.findById(examId, (err, exam) => {
          if (err) handleError(res, "Error calculating exam result!");
          if (exam) {
            let score = 0;
            exam?.answerKeys.forEach((answerKey, i) => {
              if (answerKey === answers[i]) {
                score += 1;
              }
            });
            res.json({
              examId: {
                ...student?.submittedExams?.[examId],
              },
              score,
            });
          }
        });
      }
    });
  } catch (err) {
    handleError(res, err.message);
  }
};
