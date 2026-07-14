const pool = require('../config/database');

const projectController = {
    // Get all projects with optional filtering
    async getAllProjects(req, res) {
        try {
            let query = `
                SELECT p.*, u.name as manager_name 
                FROM projects p
                LEFT JOIN users u ON p.manager_id = u.id
            `;
            const params = [];

            // Filter for team members
            if (req.user.role === 'team_member') {
                query += `
                    WHERE p.id IN (
                        SELECT project_id 
                        FROM project_members 
                        WHERE user_id = ?
                    )
                `;
                params.push(req.userId);
            }

            const [projects] = await pool.execute(query, params);
            res.json(projects);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Server error' });
        }
    },

    // Create project (Only Admin and Project Manager)
    async createProject(req, res) {
        try {
            const { name, description, start_date, end_date, team_members } = req.body;
            
            const [result] = await pool.execute(
                'INSERT INTO projects (name, description, manager_id, start_date, end_date) VALUES (?, ?, ?, ?, ?)',
                [name, description, req.userId, start_date, end_date]
            );

            const projectId = result.insertId;

            // Add team members
            if (team_members && team_members.length > 0) {
                const values = team_members.map(memberId => [projectId, memberId]);
                await pool.query(
                    'INSERT INTO project_members (project_id, user_id) VALUES ?',
                    [values]
                );
            }

            res.status(201).json({ 
                message: 'Project created successfully',
                projectId 
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Server error' });
        }
    },

    // Update project status
    async updateProjectStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            await pool.execute(
                'UPDATE projects SET status = ? WHERE id = ?',
                [status, id]
            );

            res.json({ message: 'Project status updated successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Server error' });
        }
    }
};

module.exports = projectController;