const User = require('../../Models/User');
const Class = require('../../Models/Class');
const Assignment = require('../../Models/Assignment');
const SubmitAssignment = require('../../Models/SubmitAssignment');
const Post = require('../../Models/Post');

exports.getDashboardData = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Wave 1: Fetch user, teaching classes, enrolled classes, teacher assignments, and user submissions concurrently
        const [
            user,
            teachingClasses,
            enrolledClasses,
            teacherAssignments,
            userSubmissions
        ] = await Promise.all([
            User.findById(userId)
                .select('-password -token')
                .populate('additionalDetails')
                .lean(),
            Class.find({
                $or: [
                    { admin: userId },
                    { teacher: userId }
                ]
            })
            .select('_id name description subject classTheme thumbnail entryCode student teacher addedAssignment addedPost createDate admin')
            .populate({ path: 'admin', select: 'firstName lastName email image' })
            .lean(),
            Class.find({
                student: userId
            })
            .select('_id name description subject classTheme thumbnail admin addedAssignment addedPost createDate')
            .populate({ path: 'admin', select: 'firstName lastName email image' })
            .lean(),
            Assignment.find({
                teacher: userId
            }).select('_id name dueDate uploadDate submission').lean(),
            SubmitAssignment.find({
                student: userId
            }).select('_id assignment submitDate').lean()
        ]);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // 4. Calculate Teaching Metrics
        const allTaughtStudentIds = new Set();
        const teachingClassIds = teachingClasses.map(c => c._id);
        
        teachingClasses.forEach(c => {
            if (Array.isArray(c.student)) {
                c.student.forEach(sId => allTaughtStudentIds.add(sId.toString()));
            }
        });

        // Total submissions received across all teacher assignments
        let totalSubmissionsReceived = 0;
        teacherAssignments.forEach(a => {
            totalSubmissionsReceived += Array.isArray(a.submission) ? a.submission.length : 0;
        });

        // 5. Calculate Student Metrics (Enrolled)
        const enrolledAssignmentIds = enrolledClasses.flatMap(c => c.addedAssignment || []);
        const allPostIds = [
            ...teachingClasses.flatMap(c => c.addedPost || []),
            ...enrolledClasses.flatMap(c => c.addedPost || [])
        ];

        // Wave 2: Fetch enrolled assignments and recent posts concurrently
        const [enrolledAssignments, recentPosts] = await Promise.all([
            Assignment.find({
                _id: { $in: enrolledAssignmentIds },
                status: "Published"
            })
            .select('_id name description dueDate uploadDate acceptAfterDue teacher')
            .populate({ path: 'teacher', select: 'firstName lastName image' })
            .lean(),
            Post.find({
                _id: { $in: allPostIds }
            })
            .select('_id title postBody uploadDate teacher')
            .populate({ path: 'teacher', select: 'firstName lastName image' })
            .sort({ uploadDate: -1 })
            .limit(6)
            .lean()
        ]);

        const submittedAssignmentIds = new Set(userSubmissions.map(s => s.assignment ? s.assignment.toString() : ''));

        const now = new Date();
        let completedCount = 0;
        let pendingCount = 0;
        let missingCount = 0;
        const upcomingDeadlines = [];

        enrolledAssignments.forEach(ass => {
            const isSubmitted = submittedAssignmentIds.has(ass._id.toString());
            const dueDate = ass.dueDate ? new Date(ass.dueDate) : null;
            const isOverdue = dueDate && dueDate < now;

            // Find matching class for this assignment
            const matchingClass = enrolledClasses.find(c => 
                Array.isArray(c.addedAssignment) && c.addedAssignment.some(aId => aId.toString() === ass._id.toString())
            );

            if (isSubmitted) {
                completedCount++;
            } else if (isOverdue) {
                missingCount++;
            } else {
                pendingCount++;
                if (dueDate) {
                    upcomingDeadlines.push({
                        _id: ass._id,
                        name: ass.name,
                        dueDate: ass.dueDate,
                        classId: matchingClass?._id,
                        className: matchingClass?.name || 'Classroom',
                        classTheme: matchingClass?.classTheme || '#00a896',
                        teacher: ass.teacher
                    });
                }
            }
        });

        // Sort upcoming deadlines by closest due date
        upcomingDeadlines.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

        // 6. Recent Activity Feed from Wave 2
        const recentActivity = recentPosts.map(p => ({
            _id: p._id,
            type: 'post',
            title: p.title || 'Class Announcement',
            description: p.postBody ? p.postBody.replace(/<[^>]*>?/gm, '').substring(0, 120) : '',
            date: p.uploadDate,
            author: p.teacher
        }));

        return res.status(200).json({
            success: true,
            data: {
                user,
                teachingStats: {
                    totalClasses: teachingClasses.length,
                    totalStudents: allTaughtStudentIds.size,
                    totalAssignments: teacherAssignments.length,
                    totalSubmissionsReceived,
                    classes: teachingClasses.map(c => ({
                        _id: c._id,
                        name: c.name,
                        subject: c.subject,
                        description: c.description,
                        classTheme: c.classTheme,
                        thumbnail: c.thumbnail,
                        entryCode: c.entryCode,
                        studentCount: Array.isArray(c.student) ? c.student.length : 0,
                        assignmentCount: Array.isArray(c.addedAssignment) ? c.addedAssignment.length : 0,
                        admin: c.admin
                    }))
                },
                studentStats: {
                    totalClasses: enrolledClasses.length,
                    totalAssigned: enrolledAssignments.length,
                    completedCount,
                    pendingCount,
                    missingCount,
                    completionRate: enrolledAssignments.length > 0 ? Math.round((completedCount / enrolledAssignments.length) * 100) : 100,
                    classes: enrolledClasses.map(c => ({
                        _id: c._id,
                        name: c.name,
                        subject: c.subject,
                        description: c.description,
                        classTheme: c.classTheme,
                        thumbnail: c.thumbnail,
                        admin: c.admin
                    }))
                },
                upcomingDeadlines: upcomingDeadlines.slice(0, 6),
                recentActivity: recentActivity.slice(0, 6)
            }
        });
    } catch (err) {
        next(err);
    }
};
