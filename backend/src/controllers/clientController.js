const getProviderClients = async (req, res) => {
  const db = req.app.locals.db;
  const providerId = req.params.providerId;

  try {
    const [clients] = await db.query(`
      SELECT 
        u.id,
        CONCAT(u.first_name, ' ', u.last_name) as name,
        u.email,
        u.phone_number as phone,
        MAX(c.address) as address,
        MAX(u.profile_image) as avatar,
        MAX(CASE 
          WHEN EXISTS (
            SELECT 1 FROM bookings b2 
            WHERE b2.client_id = c.id 
            AND b2.status = 'pending'
          ) THEN 'active'
          ELSE 'inactive'
        END) as status,
        FALSE as favorites,
        COUNT(DISTINCT CASE WHEN b.status = 'completed' THEN b.id END) as jobsCompleted,
        MAX((
          SELECT s.name
          FROM bookings b2
          JOIN services s ON b2.service_id = s.id
          WHERE b2.client_id = c.id
          ORDER BY b2.date DESC
          LIMIT 1
        )) as lastService,
        MAX((
          SELECT DATE_FORMAT(b3.date, '%b %d, %Y')
          FROM bookings b3
          WHERE b3.client_id = c.id
          ORDER BY b3.date DESC
          LIMIT 1
        )) as lastServiceDate,
        COALESCE(AVG(r.rating), 0) as rating
      FROM bookings b
      JOIN clients c ON b.client_id = c.id
      JOIN users u ON c.user_id = u.id
      LEFT JOIN reviews r ON r.client_id = c.id
      WHERE b.provider_id = ?
      GROUP BY u.id, u.email, u.phone_number, u.first_name, u.last_name
    `, [providerId]);

    res.json(clients);
  } catch (error) {
    console.error('Error fetching provider clients:', error);
    res.status(500).json({ message: 'Error fetching clients' });
  }
};

const updateClientStatus = async (req, res) => {
  const db = req.app.locals.db;
  const { clientId } = req.params;
  const { status } = req.body;

  try {
    await db.query('UPDATE clients SET status = ? WHERE id = ?', [status, clientId]);
    res.json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error('Error updating client status:', error);
    res.status(500).json({ message: 'Error updating status' });
  }
};

const toggleFavorite = async (req, res) => {
  const db = req.app.locals.db;
  const { clientId } = req.params;

  try {
    await db.query('UPDATE clients SET favorite = NOT favorite WHERE id = ?', [clientId]);
    res.json({ message: 'Favorite toggled successfully' });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({ message: 'Error toggling favorite' });
  }
};

const updateClient = async (req, res) => {
  const db = req.app.locals.db;
  const { clientId } = req.params;
  const { address, location_coordinates } = req.body;

  try {
    await db.query(
      'UPDATE clients SET address = ?, location_coordinates = ? WHERE id = ?',
      [address, location_coordinates, clientId]
    );
    res.status(200).json({ message: 'Client updated successfully' });
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ message: 'Error updating client' });
  }
};

const getClientByUserId = async (req, res) => {
  const db = req.app.locals.db;
  const userId = req.params.userId;

  try {
    const [rows] = await db.query(`
      SELECT c.*, u.first_name, u.last_name, u.email, u.phone_number, u.profile_image
      FROM clients c
      JOIN users u ON c.user_id = u.id
      WHERE c.user_id = ?
      LIMIT 1
    `, [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error fetching client by user ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getProviderClients,
  updateClientStatus,
  toggleFavorite,
  updateClient,
  getClientByUserId
};
