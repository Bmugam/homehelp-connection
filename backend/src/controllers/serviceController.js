const getServiceCategories = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const [categories] = await db.query(
      "SELECT DISTINCT category AS name FROM services ORDER BY category ASC"
    );
    res.json(categories);
    console.log(categories)
  } catch (error) {
    console.error("Error fetching service categories:", error);
    res.status(500).json({ message: "Error fetching service categories" });
  }
};

module.exports = {
  getServiceCategories,
};
