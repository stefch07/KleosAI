const prisma = require('../lib/prisma');

async function getAlerts(req, res) {
  const { page = 1, limit = 10, unreadOnly } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const where = { userId: req.userId };
  if (unreadOnly === 'true') where.isRead = false;

  try {
    const [alerts, total] = await Promise.all([
      prisma.alert.findMany({
        where,
        include: { review: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.alert.count({ where }),
    ]);

    res.json({ alerts, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    console.error('Get alerts error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function markAlertRead(req, res) {
  try {
    const alert = await prisma.alert.update({
      where: { id: req.params.id },
      data: { isRead: true },
    });
    res.json(alert);
  } catch (err) {
    console.error('Mark alert read error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function markAllAlertsRead(req, res) {
  try {
    await prisma.alert.updateMany({
      where: { userId: req.userId, isRead: false },
      data: { isRead: true },
    });
    res.json({ message: 'All alerts marked as read' });
  } catch (err) {
    console.error('Mark all alerts read error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getUnreadCount(req, res) {
  try {
    const count = await prisma.alert.count({ where: { userId: req.userId, isRead: false } });
    res.json({ count });
  } catch (err) {
    console.error('Get unread count error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { getAlerts, markAlertRead, markAllAlertsRead, getUnreadCount };
