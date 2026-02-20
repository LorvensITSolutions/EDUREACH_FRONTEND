export const mockUsers = [
  {
    id: 1,
    username: 'john.teacher',
    password: 'teacher123',
    role: 'teacher',
    name: 'John Smith',
    email: 'john.smith@school.edu',
    avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
    subject: 'Mathematics',
    classes: ['Grade 10A', 'Grade 10B', 'Grade 11A']
  },
  {
    id: 2,
    username: 'alice.student',
    password: 'student123',
    role: 'student',
    name: 'Alice Johnson',
    email: 'alice.johnson@student.school.edu',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
    grade: 'Grade 10A',
    studentId: 'STU2024001',
    parentId: 3
  },
  {
    id: 3,
    username: 'mary.parent',
    password: 'parent123',
    role: 'parent',
    name: 'Mary Johnson',
    email: 'mary.johnson@parent.school.edu',
    avatar: 'https://images.pexels.com/photos/3768911/pexels-photo-3768911.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
    children: [2]
  },
  {
    id: 4,
    username: 'admin.user',
    password: 'admin123',
    role: 'admin',
    name: 'Admin User',
    email: 'admin@school.edu',
    avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'
  }
];

export const mockAssignments = [
  {
    id: 1,
    title: 'Algebraic Equations',
    description: 'Solve the given algebraic equations from chapter 5',
    subject: 'Mathematics',
    dueDate: '2024-01-20',
    status: 'pending',
    teacherId: 1,
    studentIds: [2],
    grade: 'Grade 10A',
    marks: 85,
    totalMarks: 100
  },
  {
    id: 2,
    title: 'Geometry Problems',
    description: 'Complete geometry worksheet on triangles and circles',
    subject: 'Mathematics',
    dueDate: '2024-01-25',
    status: 'completed',
    teacherId: 1,
    studentIds: [2],
    grade: 'Grade 10A',
    marks: 92,
    totalMarks: 100
  },
  {
    id: 3,
    title: 'Calculus Basics',
    description: 'Introduction to derivatives and limits',
    subject: 'Mathematics',
    dueDate: '2024-01-30',
    status: 'pending',
    teacherId: 1,
    studentIds: [2],
    grade: 'Grade 10A',
    marks: null,
    totalMarks: 100
  },
  {
    id: 4,
    title: 'Science Lab Report',
    description: 'Write a detailed lab report on the chemistry experiment',
    subject: 'Chemistry',
    dueDate: '2024-02-05',
    status: 'pending',
    teacherId: 1,
    studentIds: [2],
    grade: 'Grade 10A',
    marks: null,
    totalMarks: 50
  },
  {
    id: 5,
    title: 'History Essay',
    description: 'Write an essay about World War II',
    subject: 'History',
    dueDate: '2024-02-10',
    status: 'completed',
    teacherId: 1,
    studentIds: [2],
    grade: 'Grade 10A',
    marks: 88,
    totalMarks: 100
  }
];

export const mockEvents = [
  {
    id: 1,
    title: 'Science Fair 2024',
    description: 'Annual science fair showcasing student projects and innovations',
    date: '2024-02-15',
    time: '10:00 AM',
    location: 'Main Auditorium',
    category: 'Academic',
    image: 'https://images.pexels.com/photos/2280549/pexels-photo-2280549.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1',
    rsvp: false
  },
  {
    id: 2,
    title: 'Inter-House Sports Day',
    description: 'Annual sports competition between different houses',
    date: '2024-02-20',
    time: '9:00 AM',
    location: 'School Ground',
    category: 'Sports',
    image: 'https://images.pexels.com/photos/296308/pexels-photo-296308.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1',
    rsvp: false
  },
  {
    id: 3,
    title: 'Parent-Teacher Conference',
    description: 'Monthly parent-teacher meeting to discuss student progress',
    date: '2024-01-25',
    time: '2:00 PM',
    location: 'Individual Classrooms',
    category: 'Meeting',
    image: 'https://images.pexels.com/photos/8471832/pexels-photo-8471832.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1',
    rsvp: false
  },
  {
    id: 4,
    title: 'Cultural Festival',
    description: 'Celebration of diverse cultures with performances and food',
    date: '2024-03-01',
    time: '6:00 PM',
    location: 'School Auditorium',
    category: 'Cultural',
    image: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1',
    rsvp: false
  },
  {
    id: 5,
    title: 'Career Guidance Workshop',
    description: 'Workshop on career options and college preparation',
    date: '2024-03-10',
    time: '1:00 PM',
    location: 'Conference Hall',
    category: 'Workshop',
    image: 'https://images.pexels.com/photos/3184432/pexels-photo-3184432.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1',
    rsvp: false
  },
  {
    id: 6,
    title: 'Art Exhibition',
    description: 'Display of student artwork and creative projects',
    date: '2024-03-15',
    time: '11:00 AM',
    location: 'Art Gallery',
    category: 'Cultural',
    image: 'https://images.pexels.com/photos/1707828/pexels-photo-1707828.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1',
    rsvp: false
  }
];

export const mockAnnouncements = [
  {
    id: 1,
    title: 'Winter Break Schedule',
    content: 'School will be closed from December 20th to January 5th for winter break. Classes will resume on January 6th. Please ensure all assignments are submitted before the break.',
    date: '2024-01-10',
    priority: 'high',
    category: 'General',
    pinned: true
  },
  {
    id: 2,
    title: 'New Library Hours',
    content: 'The library will now be open from 7:00 AM to 7:00 PM on weekdays and 9:00 AM to 5:00 PM on Saturdays. Sunday hours remain unchanged.',
    date: '2024-01-12',
    priority: 'medium',
    category: 'Facility',
    pinned: false
  },
  {
    id: 3,
    title: 'Uniform Policy Update',
    content: 'Updated dress code policy for the spring semester. Students are required to wear school badges at all times. Detailed guidelines have been sent to parents via email.',
    date: '2024-01-15',
    priority: 'low',
    category: 'Policy',
    pinned: false
  },
  {
    id: 4,
    title: 'Emergency Drill Schedule',
    content: 'Fire safety drill will be conducted on Friday, January 20th at 10:00 AM. All students and staff must participate. Please follow evacuation procedures.',
    date: '2024-01-18',
    priority: 'high',
    category: 'Emergency',
    pinned: true
  },
  {
    id: 5,
    title: 'Science Fair Registration',
    content: 'Registration for the annual science fair is now open. Students interested in participating should submit their project proposals by February 1st.',
    date: '2024-01-20',
    priority: 'medium',
    category: 'Academic',
    pinned: false
  },
  {
    id: 6,
    title: 'Cafeteria Menu Changes',
    content: 'New healthy meal options have been added to the cafeteria menu. Vegetarian and gluten-free options are now available daily.',
    date: '2024-01-22',
    priority: 'low',
    category: 'Facility',
    pinned: false
  }
];

export const mockGrades = [
  {
    id: 1,
    studentId: 2,
    subject: 'Mathematics',
    marks: 85,
    totalMarks: 100,
    grade: 'A',
    term: 'Mid-term',
    date: '2024-01-15',
    assignment: 'Algebra Test'
  },
  {
    id: 2,
    studentId: 2,
    subject: 'Science',
    marks: 92,
    totalMarks: 100,
    grade: 'A+',
    term: 'Mid-term',
    date: '2024-01-15',
    assignment: 'Chemistry Lab'
  },
  {
    id: 3,
    studentId: 2,
    subject: 'English',
    marks: 88,
    totalMarks: 100,
    grade: 'A',
    term: 'Mid-term',
    date: '2024-01-15',
    assignment: 'Literature Essay'
  },
  {
    id: 4,
    studentId: 2,
    subject: 'History',
    marks: 90,
    totalMarks: 100,
    grade: 'A',
    term: 'Mid-term',
    date: '2024-01-16',
    assignment: 'World War Essay'
  },
  {
    id: 5,
    studentId: 2,
    subject: 'Physics',
    marks: 87,
    totalMarks: 100,
    grade: 'A',
    term: 'Mid-term',
    date: '2024-01-17',
    assignment: 'Mechanics Test'
  },
  {
    id: 6,
    studentId: 2,
    subject: 'Art',
    marks: 95,
    totalMarks: 100,
    grade: 'A+',
    term: 'Mid-term',
    date: '2024-01-18',
    assignment: 'Portrait Drawing'
  }
];

export const mockAttendance = [
  {
    id: 1,
    studentId: 2,
    date: '2024-01-15',
    status: 'present',
    period: 'full-day'
  },
  {
    id: 2,
    studentId: 2,
    date: '2024-01-16',
    status: 'present',
    period: 'full-day'
  },
  {
    id: 3,
    studentId: 2,
    date: '2024-01-17',
    status: 'absent',
    period: 'full-day',
    reason: 'Sick'
  },
  {
    id: 4,
    studentId: 2,
    date: '2024-01-18',
    status: 'present',
    period: 'full-day'
  },
  {
    id: 5,
    studentId: 2,
    date: '2024-01-19',
    status: 'late',
    period: 'partial',
    reason: 'Traffic'
  }
];

export const mockFees = [
  {
    id: 1,
    studentId: 2,
    type: 'Tuition Fee',
    amount: 1500,
    dueDate: '2024-01-31',
    status: 'paid',
    paidDate: '2024-01-15'
  },
  {
    id: 2,
    studentId: 2,
    type: 'Library Fee',
    amount: 50,
    dueDate: '2024-01-31',
    status: 'pending',
    paidDate: null
  },
  {
    id: 3,
    studentId: 2,
    type: 'Sports Fee',
    amount: 100,
    dueDate: '2024-02-15',
    status: 'pending',
    paidDate: null
  },
  {
    id: 4,
    studentId: 2,
    type: 'Lab Fee',
    amount: 75,
    dueDate: '2024-02-28',
    status: 'pending',
    paidDate: null
  }
];