const getAllProviders = async (db) => {
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
      GROUP_CONCAT(DISTINCT s.name) as services
    FROM users u
    JOIN providers p ON u.id = p.user_id
    LEFT JOIN provider_services ps ON p.id = ps.provider_id
    LEFT JOIN services s ON ps.service_id = s.id
    WHERE u.user_type = 'provider'
    GROUP BY 
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
      p.verification_status
  `);

  return providers.map(provider => ({
    ...provider,
    services: provider.services ? provider.services.split(',') : [],
    average_rating: Number(provider.average_rating || 0),
    review_count: Number(provider.review_count || 0)
  }));
};

module.exports = {
  getAllProviders
};
