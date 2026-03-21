import Component from '../models/Component.js';
import logger from '../config/logger.js';

/**
 * GET /api/components
 * List all components, optionally filtered by category
 */
export async function listComponents(req, res) {
  try {
    const { category, include } = req.query;
    const filter = category ? { category } : {};
 
    // By default exclude code (lightweight list). If ?include=code, return everything.
    const projection = include === 'code' ? {} : { code: 0 };
 
    const components = await Component.find(filter)
      .sort({ category: 1, order: 1 })
      .select(projection)
      .lean();
 
    return res.json({
      success: true,
      data: {
        components: components.map((c) => ({
          ...c,
          id: c._id.toString(),
        })),
      },
    });
  } catch (error) {
    logger.error({ err: error }, 'Failed to list components');
    return res.status(500).json({ success: false, error: 'Failed to list components' });
  }
}
/**
 * GET /api/components/:id
 * Get a single component including its code
 */
export async function getComponent(req, res) {
  try {
    const { id } = req.params;
    const component = await Component.findById(id).lean();

    if (!component) {
      return res.status(404).json({ success: false, error: 'Component not found' });
    }

    return res.json({
      success: true,
      data: {
        component: {
          ...component,
          id: component._id.toString(),
        },
      },
    });
  } catch (error) {
    logger.error({ err: error, componentId: req.params.id }, 'Failed to get component');
    return res.status(500).json({ success: false, error: 'Failed to get component' });
  }
}