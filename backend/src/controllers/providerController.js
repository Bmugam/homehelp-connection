const getAllProviders = async (db) => {
  const [providers] = await db.query(`
    SELECT 
      u.id as user_id,
      p.id as provider_id,
      u.first_name,
      u.last_name,
      u.email,
      u.phone_number,
      u.profile_image,
      p.location,
      p.business_name,
      p.business_description,
      p.average_rating,
      p.review_count,
      p.verification_status
    FROM users u
    JOIN providers p ON u.id = p.user_id
    WHERE u.user_type = 'provider'
  `);

  for (const provider of providers) {
    const [services] = await db.query(`
      SELECT s.id, s.name, ps.price
      FROM provider_services ps
      JOIN services s ON ps.service_id = s.id
      WHERE ps.provider_id = ?
    `, [provider.provider_id]);
    provider.services = services;
    provider.average_rating = Number(provider.average_rating || 0);
    provider.review_count = Number(provider.review_count || 0);
  }
  console.log('Providers with services:', providers);

  return providers;
};

const getProvidersByService = async (db, serviceId) => {
  const [providers] = await db.query(`
    SELECT 
      u.id,
      u.first_name,
      u.last_name,
      u.email,
      u.phone_number,
      u.profile_image,
      p.location,
      p.business_name,
      p.business_description,
      p.average_rating,
      p.review_count,
      p.verification_status,
      ps.price,
      ps.description as service_description,
      ps.availability
    FROM provider_services ps
    JOIN providers p ON ps.provider_id = p.id
    JOIN users u ON p.user_id = u.id
    WHERE ps.service_id = ?
    ORDER BY p.average_rating DESC
  `, [serviceId]);

  return providers.map(provider => ({
    ...provider,
    average_rating: Number(provider.average_rating || 0),
    review_count: Number(provider.review_count || 0),
    price: Number(provider.price || 0)
  }));
};

module.exports = {
  getAllProviders,
  getProvidersByService
};
