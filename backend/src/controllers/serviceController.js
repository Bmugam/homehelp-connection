const serviceController = {
  getAllServices: async (req, res) => {
    const db = req.app.locals.db;
    try {
      const [services] = await db.query(`
        SELECT 
          s.*,
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'provider_id', p.id,
              'business_name', p.business_name,
              'provider_name', CONCAT(u.first_name, ' ', u.last_name),
              'location', p.location,
              'price', ps.price,
              'verification_status', p.verification_status,
              'average_rating', p.average_rating,
              'review_count', p.review_count
            )
          ) as providers
        FROM services s
        LEFT JOIN provider_services ps ON s.id = ps.service_id
        LEFT JOIN providers p ON ps.provider_id = p.id
        LEFT JOIN users u ON p.user_id = u.id
        GROUP BY s.id
        ORDER BY s.name ASC
      `);

      res.json(services);
    } catch (error) {
      console.error('Error fetching services:', error);
      res.status(500).json({ message: 'Error fetching services' });
    }
  },

  createService: async (req, res) => {
    const db = req.app.locals.db;
    try {
      const { name, description, category, price, duration, active = true } = req.body;

      const [result] = await db.query(
        `INSERT INTO services (name, description, category, price, duration, active)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [name, description, category, price, duration, active]
      );

      res.status(201).json({
        id: result.insertId,
        name,
        description,
        category,
        price,
        duration,
        active
      });
    } catch (error) {
      console.error('Error creating service:', error);
      res.status(500).json({ message: 'Error creating service' });
    }
  },

  updateService: async (req, res) => {
    const db = req.app.locals.db;
    try {
      const { id } = req.params;
      const { name, description, category, price, duration, active } = req.body;

      const [result] = await db.query(
        `UPDATE services 
         SET name = ?, description = ?, category = ?, price = ?, duration = ?, active = ?
         WHERE id = ?`,
        [name, description, category, price, duration, active, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Service not found' });
      }

      res.json({ message: 'Service updated successfully' });
    } catch (error) {
      console.error('Error updating service:', error);
      res.status(500).json({ message: 'Error updating service' });
    }
  },

  deleteService: async (req, res) => {
    const db = req.app.locals.db;
    try {
      const { id } = req.params;

      const [result] = await db.query('DELETE FROM services WHERE id = ?', [id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Service not found' });
      }

      res.json({ message: 'Service deleted successfully' });
    } catch (error) {
      console.error('Error deleting service:', error);
      res.status(500).json({ message: 'Error deleting service' });
    }
  },

  getServiceCategories: async (req, res) => {
    try {
      const db = req.app.locals.db;
      const [categories] = await db.query(
        "SELECT DISTINCT category AS name FROM services ORDER BY category ASC"
      );
      res.json(categories);
    } catch (error) {
      console.error("Error fetching service categories:", error);
      res.status(500).json({ message: "Error fetching service categories" });
    }
  }
};

module.exports = serviceController;
