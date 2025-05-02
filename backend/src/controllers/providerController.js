const debug = require('debug')('app:providerController');

const getAllProviders = async (db) => {
  try {
    debug('Fetching all providers');
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

    const enhancedProviders = await Promise.all(providers.map(async (provider) => {
      try {
        const [services] = await db.query(`
          SELECT s.id, s.name, ps.price
          FROM provider_services ps
          JOIN services s ON ps.service_id = s.id
          WHERE ps.provider_id = ?
        `, [provider.provider_id]);

        return {
          ...provider,
          services: services.map(service => ({
            ...service,
            price: Number(service.price || 0)
          })),
          average_rating: Number(provider.average_rating || 0),
          review_count: Number(provider.review_count || 0)
        };
      } catch (error) {
        debug(`Error fetching services for provider ${provider.provider_id}:`, error);
        return {
          ...provider,
          services: [],
          average_rating: Number(provider.average_rating || 0),
          review_count: Number(provider.review_count || 0)
        };
      }
    }));

    debug(`Successfully fetched ${enhancedProviders.length} providers`);
    return enhancedProviders;
  } catch (error) {
    debug('Error in getAllProviders:', error);
    throw new Error('Failed to fetch providers');
  }
};

const getProvidersByService = async (db, serviceId) => {
  try {
    debug(`Fetching providers for service ID: ${serviceId}`);
    if (!serviceId) {
      throw new Error('Service ID is required');
    }

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
        p.verification_status,
        ps.price,
        ps.description as service_description,
        ps.availability
      FROM provider_services ps
      JOIN providers p ON ps.provider_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE ps.service_id = ?
      ORDER BY (p.average_rating IS NULL), p.average_rating DESC
    `, [serviceId]);

    if (!providers.length) {
      debug('No providers found for this service');
      return [];
    }

      const enhancedProviders = providers.map(provider => ({
        ...provider,
        average_rating: Number(provider.average_rating || 0),
        review_count: Number(provider.review_count || 0),
        price: Number(provider.price || 0),
        availability: provider.availability
          ? (typeof provider.availability === 'string' ? JSON.parse(provider.availability) : provider.availability)
          : null
      }));

    debug(`Found ${enhancedProviders.length} providers for service ID: ${serviceId}`);
    return enhancedProviders;
  } catch (error) {
    debug('Error in getProvidersByService:', error);
    throw new Error(`Failed to fetch providers for service: ${error.message}`);
  }
};

// This function handles both user_id and provider_id
const getProviderById = async (db, id) => {
  try {
    // First, try to get provider details regardless of ID type
    const [providers] = await db.query(`
      SELECT 
        u.id as user_id,
        p.id as provider_id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone_number as phone,
        u.profile_image,
        p.location,
        p.business_name,
        p.business_description as bio,
        p.average_rating,
        p.review_count,
        p.verification_status
      FROM users u
      JOIN providers p ON u.id = p.user_id
      WHERE (u.id = ? OR p.id = ?) AND u.user_type = 'provider'
    `, [id, id]);

    if (!providers.length) return null;

    const provider = providers[0];

    // Get provider services
    const [services] = await db.query(`
      SELECT s.id, s.name, s.image, ps.price, ps.description
      FROM provider_services ps
      JOIN services s ON ps.service_id = s.id
      WHERE ps.provider_id = ?
    `, [provider.provider_id]);

    // Get provider reviews
    const [reviews] = await db.query(`
      SELECT 
        r.*,
        u.first_name,
        u.last_name,
        u.profile_image
      FROM reviews r
      JOIN clients c ON r.client_id = c.id
      JOIN users u ON c.user_id = u.id
      WHERE r.provider_id = ?
      ORDER BY r.created_at DESC
      LIMIT 5
    `, [provider.provider_id]);

    return {
      ...provider,
      name: `${provider.first_name} ${provider.last_name}`,
      services: services.map(s => ({
        id: s.id,
        name: s.name,
        price: s.price,
        description: s.description
      })),
      reviews: reviews.map(r => ({
        ...r,
        reviewer_name: `${r.first_name} ${r.last_name}`,
        reviewer_image: r.profile_image
      }))
    };
  } catch (error) {
    console.error('Error fetching provider details:', error);
    throw error;
  }
};

// Helper function to get provider_id from either user_id or provider_id
const getProviderId = async (db, id) => {
  // First check if it's already a provider_id
  const [providerCheck] = await db.query(`
    SELECT id FROM providers WHERE id = ?
  `, [id]);
  
  if (providerCheck.length) {
    return providerCheck[0].id;
  }
  
  // Then check if it's a user_id
  const [providerResult] = await db.query(`
    SELECT id FROM providers WHERE user_id = ?
  `, [id]);
  
  if (!providerResult.length) {
    throw new Error('Provider not found');
  }
  
  return providerResult[0].id;
};

const getProviderServices = async (db, id) => {
  try {
    const providerId = await getProviderId(db, id);
    
    const [services] = await db.query(`
      SELECT ps.id, ps.service_id, s.name, s.image, ps.price, ps.description, ps.availability
      FROM provider_services ps
      JOIN services s ON ps.service_id = s.id
      WHERE ps.provider_id = ?
    `, [providerId]);
    
    // Cast price to number and parse availability for each service
    const servicesWithParsedAvailability = services.map(service => {
      let availability = { days: [], timeSlots: [] };
      try {
        if (service.availability) {
          if (typeof service.availability === 'string') {
            availability = JSON.parse(service.availability);
          } else if (typeof service.availability === 'object') {
            availability = service.availability;
          }
        }
      } catch (e) {
        console.error('Error parsing availability JSON:', e);
      }
      return {
        ...service,
        price: Number(service.price),
        availability: {
          days: Array.isArray(availability.days) ? availability.days : [],
          timeSlots: Array.isArray(availability.timeSlots) ? availability.timeSlots : []
        }
      };
    });
    
    return servicesWithParsedAvailability;
  } catch (error) {
    console.error('Error fetching provider services:', error);
    return [];
  }
};

const getProviderServiceCategories = async (db, id) => {
  try {
    const providerId = await getProviderId(db, id);
    
    const [categories] = await db.query(`
      SELECT DISTINCT c.id, c.name
      FROM provider_services ps
      JOIN services s ON ps.service_id = s.id 
      JOIN categories c ON s.category_id = c.id
      WHERE ps.provider_id = ?
    `, [providerId]);
    
    return categories;
  } catch (error) {
    console.error('Error fetching provider service categories:', error);
    return [];
  }
};

const addProviderService = async (db, id, serviceData) => {
  const providerId = await getProviderId(db, id);
  
  const { service_id, price, description, availability } = serviceData;
  const [result] = await db.query(`
    INSERT INTO provider_services (provider_id, service_id, price, description, availability)
    VALUES (?, ?, ?, ?, ?)
  `, [providerId, service_id, price, description, JSON.stringify(availability)]);
  
  return { id: result.insertId, ...serviceData };
};

const updateProviderService = async (db, id, serviceId, serviceData) => {
  const providerId = await getProviderId(db, id);
  
  const { price, description, availability } = serviceData;
  await db.query(`
    UPDATE provider_services
    SET price = ?, description = ?, availability = ?
    WHERE id = ? AND provider_id = ?
  `, [price, description, JSON.stringify(availability), serviceId, providerId]);
  
  return { id: serviceId, provider_id: providerId, ...serviceData };
};

const deleteProviderService = async (db, id, serviceId) => {
  const providerId = await getProviderId(db, id);
  
  await db.query(`
    DELETE FROM provider_services
    WHERE id = ? AND provider_id = ?
  `, [serviceId, providerId]);
};

const updateProviderProfile = async (db, id, profileData) => {
  const providerId = await getProviderId(db, id);
  
  const { business_name, business_description, location } = profileData;
  await db.query(`
    UPDATE providers
    SET business_name = ?, business_description = ?, location = ?
    WHERE id = ?
  `, [business_name, business_description, location, providerId]);
  
  // Use the same id that was passed in for consistency
  const updatedProvider = await getProviderById(db, id);
  return updatedProvider;
};

const updateProviderAvailability = async (db, id, availabilityData) => {
  const providerId = await getProviderId(db, id);
  
  const { availability_hours } = availabilityData;
  await db.query(`
    UPDATE provider_services
    SET availability = ?
    WHERE provider_id = ?
  `, [JSON.stringify(availability_hours), providerId]);
  
  // Use the same id that was passed in for consistency
  const updatedProvider = await getProviderById(db, id);
  return updatedProvider;
};

const updateProviderProfileImage = async (db, user_id, imagePath) => {
  try {
    // First get provider details by joining users and providers tables
    const [providers] = await db.query(`
      SELECT 
        p.id as provider_id,
        u.id as user_id,
        u.email,
        u.first_name,
        u.last_name,
        u.profile_image
      FROM users u
      JOIN providers p ON u.id = p.user_id
      WHERE u.id = ? AND u.user_type = 'provider'
    `, [user_id]);

    if (!providers.length) {
      throw new Error('Provider not found');
    }

    // Update profile_image in users table
    await db.query('UPDATE users SET profile_image = ? WHERE id = ?', 
      [imagePath, user_id]
    );

    // Return updated provider data
    const [updatedProviders] = await db.query(`
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
        p.business_description as bio,
        p.average_rating,
        p.review_count,
        p.verification_status
      FROM providers p
      JOIN users u ON p.user_id = u.id
      WHERE u.id = ?
    `, [user_id]);

    if (!updatedProviders.length) {
      throw new Error('Provider not found after update');
    }

    return updatedProviders[0];
  } catch (error) {
    console.error('Error in updateProviderProfileImage:', error);
    throw error;
  }
};

module.exports = {
  getAllProviders,
  getProvidersByService,
  getProviderById,
  getProviderServices,
  addProviderService,
  updateProviderService,
  deleteProviderService,
  updateProviderProfile,
  updateProviderAvailability,
  updateProviderProfileImage
};
