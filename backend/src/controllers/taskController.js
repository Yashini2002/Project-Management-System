const pool = require('../config/database');

const taskController = {
    // Get tasks by project
    async getTasksByProject(req, res) {
        try {
            const { projectId } = req.params;
            
            const [tasks] = await pool.execute(`
                SELECT t.*, u.name as assigned_to_name 
                FROM tasks t
                LEFT JOIN users u ON t.assigned_to = u.id
                WHERE t.project_id = ?
            `, [projectId]);

            res.json(tasks);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Server error' });
        }
    },

    // Create task (Project Manager only)
    async createTask(req, res) {
        try {
            const { title, description, project_id, assigned_to, due_date, priority } = req.body;

            const [result] = await pool.execute(
                `INSERT INTO tasks 
                (title, description, project_id, assigned_to, due_date, priority) 
                VALUES (?, ?, ?, ?, ?, ?)`,
                [title, description, project_id, assigned_to, due_date, priority]
            );

            res.status(201).json({ 
                message: 'Task created successfully',
                taskId: result.insertId 
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Server error' });
        }
    },

    // Update task status (Team Member)
    async updateTaskStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            // Check if user is assigned to this task
            if (req.user.role === 'team_member') {
                const [task] = await pool.execute(
                    'SELECT assigned_to FROM tasks WHERE id = ?',
                    [id]
                );
                if (task[0].assigned_to !== req.userId) {
                    return res.status(403).json({ 
                        error: 'You can only update tasks assigned to you' 
                    });
                }
            }

            await pool.execute(
                'UPDATE tasks SET status = ? WHERE id = ?',
                [status, id]
            );

            res.json({ message: 'Task status updated successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Server error' });
        }
    }
};

module.exports = taskController;