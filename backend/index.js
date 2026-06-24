const express = require('express');
const knexLib = require('knex');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

const db = knexLib({
  client: 'sqlite3',
  connection: { filename: path.join(__dirname, 'data', 'dev.sqlite') },
  useNullAsDefault: true,
});

async function ensureSchema() {
  async function addDonationColumn(name, callback) {
    const exists = await db.schema.hasColumn('donations', name);
    if (!exists) await db.schema.table('donations', callback);
  }

  const existsUsers = await db.schema.hasTable('users');
  if (!existsUsers) {
    await db.schema.createTable('users', (t) => {
      t.increments('id').primary();
      t.string('name').notNullable();
      t.string('email').notNullable().unique();
      t.string('password').notNullable();
      t.string('role').notNullable().defaultTo('donor');
      t.timestamps(true, true);
    });
  }

  const existsDonations = await db.schema.hasTable('donations');
  if (!existsDonations) {
    await db.schema.createTable('donations', (t) => {
      t.increments('id').primary();
      t.integer('donor_id').unsigned().references('id').inTable('users');
      t.string('title').notNullable();
      t.text('description');
      t.string('status').notNullable().defaultTo('available');
      t.float('latitude');
      t.float('longitude');
      t.string('pickup_address');
      t.string('delivery_address');
      t.string('pickup_time');
      t.timestamp('picked_up_at');
      t.timestamp('delivered_at');
      t.integer('claimed_by').unsigned().references('id').inTable('users');
      t.integer('volunteer_id').unsigned().references('id').inTable('users');
      t.timestamps(true, true);
    });
  } else {
    await addDonationColumn('claimed_by', (t) => t.integer('claimed_by').unsigned().references('id').inTable('users'));
    await addDonationColumn('volunteer_id', (t) => t.integer('volunteer_id').unsigned().references('id').inTable('users'));
    await addDonationColumn('pickup_address', (t) => t.string('pickup_address'));
    await addDonationColumn('delivery_address', (t) => t.string('delivery_address'));
    await addDonationColumn('pickup_time', (t) => t.string('pickup_time'));
    await addDonationColumn('picked_up_at', (t) => t.timestamp('picked_up_at'));
    await addDonationColumn('delivered_at', (t) => t.timestamp('delivered_at'));
  }

  const existsEventPosts = await db.schema.hasTable('event_posts');
  if (!existsEventPosts) {
    await db.schema.createTable('event_posts', (t) => {
      t.increments('id').primary();
      t.integer('ngo_id').unsigned().references('id').inTable('users');
      t.string('title').notNullable();
      t.text('description');
      t.string('location');
      t.string('event_date');
      t.integer('meals_served').defaultTo(0);
      t.timestamps(true, true);
    });
  }
}

const app = express();
app.use(cors());
app.use(express.json());

// Simple health
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Friendly root page with quick links
app.get('/', (req, res) => {
  res.send(`<html><body>
    <h3>Food Waste Rescue Network — Backend</h3>
    <ul>
      <li><a href="http://localhost:5173/" target="_blank">Open Frontend App (Vite)</a></li>
      <li><a href="/api/health">API Health</a></li>
    </ul>
  </body></html>`)
});

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'missing fields' });
    const hashed = await bcrypt.hash(password, 10);
    const [id] = await db('users').insert({ name, email, password: hashed, role: role || 'donor' });
    const token = jwt.sign({ id, role: role || 'donor' }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id, name, email, role: role || 'donor' } });
  } catch (err) {
    console.error(err);
    if (err && (err.code === 'SQLITE_CONSTRAINT' || String(err.message).includes('UNIQUE'))) {
      return res.status(409).json({ error: 'email already registered' });
    }
    res.status(500).json({ error: 'registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'missing fields' });
    const user = await db('users').where({ email }).first();
    if (!user) return res.status(401).json({ error: 'invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'login failed' });
  }
});

// Middleware
function authenticate(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'missing token' });
  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'invalid token' });
  try {
    const payload = jwt.verify(parts[1], JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'invalid token' });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) return res.status(403).json({ error: 'forbidden' });
    if (req.user.role !== role) return res.status(403).json({ error: 'insufficient role' });
    next();
  };
}

// Email helper
const nodemailer = require('nodemailer');
function sendEmail(to, subject, text) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  return transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text }).catch((err) => {
    console.warn('email failed', err.message);
  });
}

// Donations routes (basic CRUD stubs)
app.get('/api/donations', async (req, res) => {
  const rows = await db('donations').select();
  res.json(rows);
});

app.post('/api/donations', authenticate, requireRole('donor'), async (req, res) => {
  try {
    const { title, description, latitude, longitude, pickup_address, delivery_address, pickup_time } = req.body;
    const [id] = await db('donations').insert({
      donor_id: req.user.id,
      title,
      description,
      latitude,
      longitude,
      pickup_address,
      delivery_address,
      pickup_time,
    });
    const donation = await db('donations').where({ id }).first();
    res.json(donation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'create failed' });
  }
});

app.post('/api/donations/:id/claim', authenticate, requireRole('ngo'), async (req, res) => {
  try {
    const { id } = req.params;
    await db('donations').where({ id }).update({ status: 'claimed', claimed_by: req.user.id });
    const donation = await db('donations').where({ id }).first();
    // notify donor
    const donor = await db('users').where({ id: donation.donor_id }).first();
    if (donor && donor.email) sendEmail(donor.email, 'Your donation was claimed', `Donation ${donation.title} claimed by NGO.`);
    res.json(donation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'claim failed' });
  }
});

// Volunteer assignment
app.post('/api/donations/:id/assign', authenticate, requireRole('volunteer'), async (req, res) => {
  try {
    const { id } = req.params;
    await db('donations').where({ id }).update({ status: 'assigned', volunteer_id: req.user.id });
    const donation = await db('donations').where({ id }).first();
    // notify donor
    const donor = await db('users').where({ id: donation.donor_id }).first();
    if (donor && donor.email) sendEmail(donor.email, 'Volunteer assigned', `A volunteer has been assigned to pick up your donation: ${donation.title}`);
    res.json(donation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'assign failed' });
  }
});

app.post('/api/donations/:id/status', authenticate, requireRole('volunteer'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['picked_up', 'delivered'].includes(status)) return res.status(400).json({ error: 'invalid status' });

    const updates = { status };
    if (status === 'picked_up') updates.picked_up_at = db.fn.now();
    if (status === 'delivered') updates.delivered_at = db.fn.now();

    await db('donations').where({ id, volunteer_id: req.user.id }).update(updates);
    const donation = await db('donations').where({ id }).first();
    if (!donation) return res.status(404).json({ error: 'donation not assigned to this volunteer' });
    res.json(donation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'status update failed' });
  }
});

app.get('/api/events', async (req, res) => {
  const rows = await db('event_posts').orderBy('created_at', 'desc').select();
  res.json(rows);
});

app.post('/api/events', authenticate, requireRole('ngo'), async (req, res) => {
  try {
    const { title, description, location, event_date, meals_served } = req.body;
    if (!title) return res.status(400).json({ error: 'title is required' });
    const [id] = await db('event_posts').insert({
      ngo_id: req.user.id,
      title,
      description,
      location,
      event_date,
      meals_served: Number(meals_served) || 0,
    });
    const event = await db('event_posts').where({ id }).first();
    res.json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'event post failed' });
  }
});

// Dashboards
app.get('/api/dashboard/donor', authenticate, requireRole('donor'), async (req, res) => {
  const donations = await db('donations').where({ donor_id: req.user.id }).select();
  res.json({ donations });
});

app.get('/api/dashboard/ngo', authenticate, requireRole('ngo'), async (req, res) => {
  const available = await db('donations').where({ status: 'available' }).select();
  res.json({ available });
});

app.get('/api/dashboard/volunteer', authenticate, requireRole('volunteer'), async (req, res) => {
  const assigned = await db('donations').where({ volunteer_id: req.user.id }).select();
  res.json({ assigned });
});

// Start
(async () => {
  await ensureSchema();
  app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
})();
