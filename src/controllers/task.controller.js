import pool from "../config/mysql.config.js";

// Obtener todas las tareas del usuario autenticado
export const getTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const [tasks] = await pool.query("SELECT * FROM tasks WHERE user_id = ?", [userId]);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ 
      message: "Error al obtener tareas", 
      ok: false 
    });
  }
};

// Crear tarea
export const createTask = async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user.id;

    if (!title || !description) {
      return res.status(400).json({ 
        message: "Título y descripción son obligatorios", 
        ok: false 
      });
    }

    // Insertar la tarea y obtener el ID insertado
    const [result] = await pool.query(
      "INSERT INTO tasks (title, description, user_id) VALUES (?, ?, ?)",
      [title, description, userId]
    );

    // Obtener la tarea recién creada
    const [newTask] = await pool.query("SELECT * FROM tasks WHERE id = ?", [result.insertId]);

    res.status(201).json(newTask[0]); // Devolver la tarea creada
  } catch (error) {
    res.status(500).json({ 
      message: "Error al crear tarea", 
      ok: false 
    });
  }
};




// Actualizar una tarea
export const updateTask = async (req, res) => {
  try {
    const { title, description, status } = req.body;
    const { id } = req.params;
    const userId = req.user.id;

    await pool.query(
      "UPDATE tasks SET title = ?, description = ?, status = ? WHERE id = ? AND user_id = ?",
      [title, description, status, id, userId]
    );

    res.json({ 
      message: "Tarea actualizada", 
      ok: true 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error al actualizar tarea", 
      ok: false 
    });
  }
};

// Eliminar una tarea
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await pool.query("DELETE FROM tasks WHERE id = ? AND user_id = ?", [id, userId]);
    res.json({ 
      message: "Tarea eliminada", 
      ok: true 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error al eliminar tarea", 
      ok: false 
    });
  }
};
