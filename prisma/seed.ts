import { PrismaClient, Role, SubmissionStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { generateUniqueClassCode } from '../src/lib/classCode';

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data
  await prisma.activityLog.deleteMany();
  await prisma.selfNote.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  const salt = await bcrypt.genSalt(12);

  // Create Admin
  const adminPassword = await bcrypt.hash('admin123', salt);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@edutrack.com',
      name: 'Admin User',
      passwordHash: adminPassword,
      role: Role.ADMIN,
    },
  });
  await prisma.activityLog.create({
    data: { userId: admin.id, action: 'USER_CREATED' },
  });

  // Create Instructors
  const instructor1Password = await bcrypt.hash('instructor123', salt);
  const instructor1 = await prisma.user.create({
    data: {
      email: 'instructor1@edutrack.com',
      name: 'Instructor One',
      passwordHash: instructor1Password,
      role: Role.INSTRUCTOR,
    },
  });
  await prisma.activityLog.create({
    data: { userId: instructor1.id, action: 'USER_CREATED' },
  });

  const instructor2Password = await bcrypt.hash('instructor123', salt);
  const instructor2 = await prisma.user.create({
    data: {
      email: 'instructor2@edutrack.com',
      name: 'Instructor Two',
      passwordHash: instructor2Password,
      role: Role.INSTRUCTOR,
    },
  });
  await prisma.activityLog.create({
    data: { userId: instructor2.id, action: 'USER_CREATED' },
  });

  // Create Students
  const studentPassword = await bcrypt.hash('student123', salt);
  const students = await Promise.all(
    Array.from({ length: 10 }, (_, i) =>
      prisma.user.create({
        data: {
          email: `student${i + 1}@edutrack.com`,
          name: `Student ${i + 1}`,
          passwordHash: studentPassword,
          role: Role.STUDENT,
        },
      })
    )
  );
  await prisma.activityLog.createMany({
    data: students.map((s) => ({ userId: s.id, action: 'USER_CREATED' })),
  });

  // Create Courses
  const course1 = await prisma.course.create({
    data: {
      title: 'Introduction to Programming',
      description: 'Learn the fundamentals of programming.',
      instructorId: instructor1.id,
      classCode: await generateUniqueClassCode(),
    },
  });
  await prisma.activityLog.create({
    data: {
      userId: instructor1.id,
      action: 'COURSE_CREATED',
      metadata: { courseId: course1.id },
    },
  });

  const course2 = await prisma.course.create({
    data: {
      title: 'Advanced Web Development',
      description: 'Deep dive into modern web technologies.',
      instructorId: instructor2.id,
      classCode: await generateUniqueClassCode(),
    },
  });
  await prisma.activityLog.create({
    data: {
      userId: instructor2.id,
      action: 'COURSE_CREATED',
      metadata: { courseId: course2.id },
    },
  });

  const course3 = await prisma.course.create({
    data: {
      title: 'Data Structures and Algorithms',
      description: 'Master essential data structures.',
      instructorId: instructor1.id,
      classCode: await generateUniqueClassCode(),
    },
  });
  await prisma.activityLog.create({
    data: {
      userId: instructor1.id,
      action: 'COURSE_CREATED',
      metadata: { courseId: course3.id },
    },
  });

  // Enroll Students
  const enrollments = [
    // Course 1
    ...students.slice(0, 5).map((s) => ({ userId: s.id, courseId: course1.id })),
    // Course 2
    ...students.slice(5, 10).map((s) => ({ userId: s.id, courseId: course2.id })),
    // Course 3
    ...students.slice(2, 7).map((s) => ({ userId: s.id, courseId: course3.id })),
  ];
  await prisma.enrollment.createMany({ data: enrollments });
  await prisma.activityLog.createMany({
    data: enrollments.map((e) => ({
      userId: e.userId,
      action: 'ENROLL_COURSE',
      metadata: { courseId: e.courseId },
    })),
  });

  // Create Announcements
  const announcements = [
    { courseId: course1.id, title: 'Welcome!', body: 'Welcome to the course.' },
    { courseId: course1.id, title: 'Midterm Reminder', body: 'Midterm is next week.' },
    { courseId: course2.id, title: 'Project Specs', body: 'Project specs are up.' },
    { courseId: course2.id, title: 'Office Hours', body: 'Cancelled for this week.' },
    { courseId: course3.id, title: 'First Assignment', body: 'First assignment is posted.' },
    { courseId: course3.id, title: 'Study Group', body: 'Form your study groups.' },
  ];
  await prisma.announcement.createMany({ data: announcements });

  // Create Assignments
  const now = new Date();
  const assignments = [
    // Course 1
    { courseId: course1.id, title: 'HW 1', dueDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
    { courseId: course1.id, title: 'HW 2', dueDate: now },
    { courseId: course1.id, title: 'HW 3', dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
    // Course 2
    { courseId: course2.id, title: 'Project Proposal', dueDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
    { courseId: course2.id, title: 'Milestone 1', dueDate: now },
    { courseId: course2.id, title: 'Final Project', dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
    // Course 3
    { courseId: course3.id, title: 'Problem Set A', dueDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
    { courseId: course3.id, title: 'Problem Set B', dueDate: now },
    { courseId: course3.id, title: 'Problem Set C', dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
  ];
  const createdAssignments = await Promise.all(
    assignments.map(a => prisma.assignment.create({ data: a }))
  );

  // Create Submissions
  const submissions = [];
  for (const assignment of createdAssignments) {
    const courseEnrollments = await prisma.enrollment.findMany({
      where: { courseId: assignment.courseId },
      select: { userId: true },
    });
    const enrolledStudentIds = courseEnrollments.map(e => e.userId);

    for (const studentId of enrolledStudentIds) {
      if (Math.random() < 0.6) {
        const status = SubmissionStatus.SUBMITTED;
        submissions.push({
          assignmentId: assignment.id,
          studentId: studentId,
          status: status,
          submittedAt: new Date(),
        });
      }
    }
  }
  await prisma.submission.createMany({ data: submissions });
  await prisma.activityLog.createMany({
    data: submissions.map(s => ({
      userId: s.studentId,
      action: 'SUBMIT_ASSIGNMENT',
      metadata: { assignmentId: s.assignmentId },
    })),
  });

  // Create Self-Notes
  const notes = [];
  for (const student of students) {
    for (let i = 0; i < Math.floor(Math.random() * 2) + 2; i++) {
      notes.push({
        userId: student.id,
        title: `Note ${i + 1} for ${student.name}`,
        body: 'This is a self note.',
      });
    }
  }
  await prisma.selfNote.createMany({ data: notes });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
