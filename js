require("dotenv").config();
const bcrypt = require("bcrypt");
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const adminRoutes = require("./routes/admin");
const attendanceRoutes = require("./routes/attendance");
const { validatePassword } = require("./middleware/validatePassword");

const app = express();
const prisma = new PrismaClient();

// FILE UPLOAD CONFIG
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static("uploads"));

// Serve frontend static files
app.use(express.static(path.join(__dirname, "..", "frontend")));

// Mount admin routes
app.use("/admin", adminRoutes);

// Mount attendance routes
app.use("/faculty/attendance", attendanceRoutes);

// Admin login alias (so /login/admin works like /login/student)
app.post("/login/admin", async (req, res) => {
  try {
    const { uid, password } = req.body;

    const admin = await prisma.admin.findUnique({ where: { uid } });

    if (!admin) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, admin.password);

    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json({
      message: "Admin login successful",
      uid: admin.uid,
      name: admin.name
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Test route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "idx1.html"));
});

/* =========================
   STUDENT AUTH
========================= */

// Register Student
app.post("/register/student", async (req, res) => {
  try {
    const { uid, name, password } = req.body;

    if (!uid || !password) {
      return res.status(400).json({ error: "UID and password required" });
    }

    // Password strength validation (before hashing)
    const pwCheck = validatePassword(password);
    if (!pwCheck.valid) {
      return res.status(400).json({ error: pwCheck.error });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = await prisma.student.create({
      data: { uid, name: name || uid, password: hashedPassword }
    });

    res.json({ message: "Student registered successfully", uid: student.uid, name: student.name });

  } catch (error) {
    console.error(error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: "UID already exists" });
    }
    res.status(500).json({ error: error.message });
  }
});

// Login Student
app.post("/login/student", async (req, res) => {
  try {
    const { uid, password } = req.body;

    const student = await prisma.student.findUnique({
      where: { uid }
    });

    if (!student) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, student.password);

    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json({ message: "Login successful", uid: student.uid, name: student.name });

  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

/* =========================
   FACULTY AUTH
========================= */

// Register Faculty
app.post("/register/faculty", async (req, res) => {
  try {
    const { uid, name, password } = req.body;

    if (!uid || !password) {
      return res.status(400).json({ error: "UID and password required" });
    }

    // Password strength validation (before hashing)
    const pwCheck = validatePassword(password);
    if (!pwCheck.valid) {
      return res.status(400).json({ error: pwCheck.error });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const faculty = await prisma.faculty.create({
      data: { uid, name: name || uid, password: hashedPassword }
    });

    res.json({ message: "Faculty registered successfully", uid: faculty.uid, name: faculty.name });

  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: "UID already exists" });
    }
    res.status(500).json({ error: error.message });
  }
});

// Login Faculty
app.post("/login/faculty", async (req, res) => {
  try {
    const { uid, password } = req.body;

    const faculty = await prisma.faculty.findUnique({
      where: { uid }
    });

    if (!faculty) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, faculty.password);

    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json({ message: "Faculty login successful", uid: faculty.uid, name: faculty.name });

  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

app.post("/faculty/material", upload.single("file"), async (req, res) => {
  try {
    const { chapterId, title } = req.body;

    if (!req.file || !chapterId || !title) {
      return res.status(400).json({ error: "All fields required" });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    await prisma.studyMaterial.create({
      data: {
        title,
        link: fileUrl,
        chapterId: parseInt(chapterId)
      }
    });

    res.json({ message: "Material uploaded successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Upload failed" });
  }
});
/* =========================
   DASHBOARDS
========================= */

// Faculty Dashboard
app.get("/faculty/dashboard/:uid", async (req, res) => {
  try {
    const { uid } = req.params;

    const faculty = await prisma.faculty.findUnique({
      where: { uid },
      include: {
        subjects: {
          include: {
            timetables: true,
            liveClasses: true,
            section: true,
            units: {
              orderBy: { order: "asc" },
              include: {
                chapters: {
                  orderBy: { order: "asc" }
                }
              }
            }
          }
        }
      }
    });

    if (!faculty) {
      return res.status(404).json({ error: "Faculty not found" });
    }

    res.json({
      uid: faculty.uid,
      name: faculty.name,
      subjects: faculty.subjects
    });

  } catch (error) {
    res.status(500).json({ error: "Failed to load dashboard" });
  }
});
// Student Dashboard
app.get("/student/dashboard/:uid", async (req, res) => {
  try {
    const { uid } = req.params;

    const student = await prisma.student.findUnique({
      where: { uid },
      include: {
        section: {
          include: {
            subjects: {
              include: {
                timetables: true,
                liveClasses: true,
                faculty: {
                  select: {
                    uid: true,
                    name: true
                  }
                },
                units: {
                  orderBy: { order: "asc" },
                  include: {
                    chapters: {
                      orderBy: { order: "asc" },
                      include: {
                        materials: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json({
      uid: student.uid,
      name: student.name,
      section: student.section
    });

  } catch (error) {
    res.status(500).json({ error: "Failed to load dashboard" });
  }
});



/* =========================
   LIVE CLASS
========================= */

app.post("/faculty/liveclass", async (req, res) => {
  try {
    const { subjectId, topic, link, date } = req.body;

    if (!subjectId || !topic || !link || !date) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const liveClass = await prisma.liveClass.create({
      data: {
        subjectId: parseInt(subjectId),
        topic,
        link,
        date: new Date(date)
      }
    });

    res.json({ message: "Live class created successfully", liveClass });

  } catch (error) {
    res.status(500).json({ error: "Failed to create live class" });
  }
});

app.get("/academic/setup", async (req, res) => {
  try {
    const subject = await prisma.subject.findFirst({
      where: { name: "DBMS" }
    });

    if (!subject) return res.json({ error: "Subject not found" });

    const unit1 = await prisma.unit.create({
      data: {
        title: "Unit 1 (Theory)",
        order: 1,
        subjectId: subject.id
      }
    });

    const unit2 = await prisma.unit.create({
      data: {
        title: "Unit 2 (Theory)",
        order: 2,
        subjectId: subject.id
      }
    });

    await prisma.chapter.createMany({
      data: [
        { title: "Chapter 1.1", order: 1, unitId: unit1.id },
        { title: "Chapter 1.2", order: 2, unitId: unit1.id },
        { title: "Chapter 2.1", order: 1, unitId: unit2.id }
      ]
    });

    res.json({ message: "Units & Chapters created successfully" });

  } catch (err) {
    res.json({ error: err.message });
  }
});

// Note: /faculty/material is already defined above with multer file upload support
//Create Quiz(Faculty)
app.post("/faculty/quiz", async (req, res) => {
  try {
    const { title, openDate, closeDate, timeLimit, attempts, unitId } = req.body;

    const quiz = await prisma.quiz.create({
      data: {
        title,
        openDate: new Date(openDate),
        closeDate: new Date(closeDate),
        timeLimit,
        attempts,
        unitId
      }
    });

    res.json({ message: "Quiz created", quiz });

  } catch (error) {
    res.status(500).json({ error: "Failed to create quiz" });
  }
});
//add question
app.post("/faculty/question", async (req, res) => {
  try {
    const { quizId, question, optionA, optionB, optionC, optionD, correct } = req.body;

    const q = await prisma.question.create({
      data: {
        quizId,
        question,
        optionA,
        optionB,
        optionC,
        optionD,
        correct
      }
    });

    res.json({ message: "Question added", q });

  } catch (error) {
    res.status(500).json({ error: "Failed to add question" });
  }
});

//Get quiz
app.get("/student/quiz/:quizId", async (req, res) => {
  const quiz = await prisma.quiz.findUnique({
    where: { id: parseInt(req.params.quizId) },
    include: { questions: true }
  });

  res.json(quiz);
});

//Submit quiz
app.post("/student/quiz/submit", async (req, res) => {
  try {
    const { quizId, studentId, answers } = req.body;

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true }
    });

    let score = 0;

    quiz.questions.forEach(q => {
      if (answers[q.id] === q.correct) {
        score++;
      }
    });

    const submission = await prisma.quizSubmission.create({
      data: {
        quizId,
        studentId,
        score,
        startedAt: new Date(),
        completedAt: new Date()
      }
    });

    res.json({ message: "Quiz submitted", score });

  } catch (error) {
    res.status(500).json({ error: "Submission failed" });
  }
});

/* =========================
   STUDENT ATTENDANCE VIEW
========================= */
app.get("/student/attendance/:uid", async (req, res) => {
  try {
    const { uid } = req.params;

    const student = await prisma.student.findUnique({
      where: { uid },
      include: { section: true }
    });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    if (!student.sectionId) {
      return res.json({ courses: [] });
    }

    // Get all courses in student's section
    const courses = await prisma.subject.findMany({
      where: { sectionId: student.sectionId },
      include: {
        faculty: { select: { name: true } },
        attendanceSessions: {
          where: { sectionId: student.sectionId },
          include: {
            records: {
              where: { studentId: student.id }
            }
          },
          orderBy: { lectureDate: "asc" }
        }
      }
    });

    // Compute attendance dynamically
    const result = courses.map(course => {
      const totalSessions = course.attendanceSessions.length;
      let presentCount = 0;

      course.attendanceSessions.forEach(session => {
        const record = session.records[0]; // only this student's record
        if (record && record.status === "present") {
          presentCount++;
        }
      });

      const percentage = totalSessions > 0
        ? Math.round((presentCount / totalSessions) * 100)
        : 0;

      return {
        courseId: course.id,
        courseName: course.name,
        faculty: course.faculty?.name || "N/A",
        totalLectures: totalSessions,
        present: presentCount,
        absent: totalSessions - presentCount,
        percentage
      };
    });

    res.json({ courses: result });
  } catch (error) {
    console.error("Student attendance error:", error);
    res.status(500).json({ error: "Failed to fetch attendance" });
  }
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");

  // Auto-open browser
  const { exec } = require("child_process");
  const platform = process.platform;
  const url = "http://localhost:5000";

  if (platform === "win32") {
    exec(`start ${url}`);
  } else if (platform === "darwin") {
    exec(`open ${url}`);
  } else {
    exec(`xdg-open ${url}`);
  }
});
