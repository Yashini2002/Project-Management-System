const pool = require('../config/database');

class User {
    static async create(userData) {
        const { name, email, password, role } = userData;
        const [result] = await pool.execute(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, password, role]
        );
        return result.insertId;
    }

    static async findByEmail(email) {
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        return rows[0];
    }

    static async findById(id) {
        const [rows] = await pool.execute(
            'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async findAll() {
        const [rows] = await pool.execute(
            'SELECT id, name, email, role, created_at FROM users'
        );
        return rows;
    }

    static async updateRole(userId, role) {
        await pool.execute(
            'UPDATE users SET role = ? WHERE id = ?',
            [role, userId]
        );
    }
}

module.exports = User;